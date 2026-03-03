/**
 * 伺服器端 TTL 快取，用於減少 Firestore 讀取次數（配合免費版每日 5 萬次限制）。
 * 統計與列表相同條件的重複請求在 TTL 內直接回傳快取，寫入（新增/匯入/編輯/刪除）後會清除快取以保證資料一致。
 */

const TTL_MS = 2 * 60 * 1000 // 2 分鐘
const MAX_KEYS = 800

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()
let lastEvict = 0
const EVICT_INTERVAL_MS = 60 * 1000 // 每分鐘清理過期 key

function evictIfNeeded() {
  const now = Date.now()
  if (now - lastEvict < EVICT_INTERVAL_MS) return
  lastEvict = now
  for (const [k, v] of store.entries()) {
    if (v.expiresAt <= now) store.delete(k)
  }
  if (store.size <= MAX_KEYS) return
  const entries = [...store.entries()].sort((a, b) => (a[1].expiresAt as number) - (b[1].expiresAt as number))
  const toDel = entries.slice(0, store.size - MAX_KEYS)
  toDel.forEach(([k]) => store.delete(k))
}

export function getCache<T>(key: string): T | null {
  evictIfNeeded()
  const entry = store.get(key) as CacheEntry<T> | undefined
  if (!entry || entry.expiresAt <= Date.now()) return null
  return entry.value
}

export function setCache<T>(key: string, value: T, ttlMs: number = TTL_MS): void {
  evictIfNeeded()
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  })
}

/** 寫入資料後呼叫，清除所有快取使下次讀取取得最新結果 */
export function clearRequestCache(): void {
  store.clear()
}
