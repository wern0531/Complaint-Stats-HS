import type { Firestore, DocumentSnapshot } from 'firebase-admin/firestore'
import type { MonthlyBucket, DashboardData, ComplaintStats, ParetoStats, ShelfLifeStats, KeywordStats } from '~/types/complaint'

const STATS_DOC_PATH = 'statistics/dashboard'
const COMPLAINTS_COLLECTION = 'complaints'
const MAX_FIRESTORE_READ = 5000

const ONLINE_PLATFORM_KEYWORDS = [
  '酷澎', '酷膨', '酷彭', '酷鵬',
  'MOMO', 'momo',
  '蝦皮', '蝦皮商城',
  '線上家樂福', 'uber家樂福',
  '熊貓超市', 'foodpanda'
]

const SHELF_LIFE_BUCKETS: Array<{ label: string; minDays: number; maxDays: number | null }> = [
  { label: '已過期', minDays: -Infinity, maxDays: -1 },
  { label: '0-3 個月內到期', minDays: 0, maxDays: 90 },
  { label: '3-6 個月內到期', minDays: 91, maxDays: 180 },
  { label: '6-12 個月內到期', minDays: 181, maxDays: 365 },
  { label: '12 個月以上', minDays: 366, maxDays: null }
]

const STOP_WORDS = new Set([
  '的', '了', '是', '在', '有', '与', '及', '等', '和', '或', '不', '也', '就', '都', '而', '被', '把', '让', '给', '为', '以',
  '与', '若', '如', '但', '因', '此', '由', '从', '到', '之', '未', '无', '没有', '可能', '可以', '进行', '相关', '问题', '分析', '原因',
  '與', '及', '等', '或', '和', '之', '與', '或', '若', '如', '但', '因', '此', '由', '從', '到', '未', '無', '沒有', '可能', '可以', '進行', '相關', '問題', '分析', '原因',
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'
])

function isOnlinePlatform(channel: string): boolean {
  if (!channel) return false
  return ONLINE_PLATFORM_KEYWORDS.some(k => channel.toLowerCase().includes(k.toLowerCase()))
}

function normalizeChannel(channel: string): string {
  if (!channel) return '未知'
  if (isOnlinePlatform(channel)) return '網購平台'
  const mainChannels = ['7-11', '萊爾富', '全家', 'OK', '家樂福', '全聯', '大潤發']
  for (const main of mainChannels) {
    if (channel.includes(main)) return main
  }
  return '其他'
}

/** 從 YYYYMMDD 字串或 Date 取得 bucket key "YYYY-MM" */
export function getBucketKey(date: string | Date): string {
  if (date instanceof Date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  }
  const s = String(date ?? '').replace(/\D/g, '')
  if (s.length >= 6) return `${s.slice(0, 4)}-${s.slice(4, 6)}`
  return ''
}

function parseYmd(s: string | number | undefined): Date | null {
  if (s == null) return null
  const raw = String(s).replace(/\D/g, '')
  if (raw.length >= 8) {
    const y = parseInt(raw.slice(0, 4), 10)
    const m = parseInt(raw.slice(4, 6), 10) - 1
    const d = parseInt(raw.slice(6, 8), 10)
    const date = new Date(y, m, d)
    return isNaN(date.getTime()) ? null : date
  }
  if (raw.length >= 6) {
    const y = raw.length === 8 ? parseInt(raw.slice(0, 4), 10) : 2000 + parseInt(raw.slice(0, 2), 10)
    const m = parseInt(raw.slice(raw.length - 4, raw.length - 2), 10) - 1
    const d = parseInt(raw.slice(-2), 10)
    const date = new Date(y, m, d)
    return isNaN(date.getTime()) ? null : date
  }
  return null
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000))
}

function getShelfLifeLabel(reactionTime: string | number | undefined, expiryDate: string | number | undefined): string {
  const reaction = parseYmd(reactionTime)
  const expiry = parseYmd(expiryDate)
  if (!reaction || !expiry) return '未分類'
  const daysLeft = daysBetween(reaction, expiry)
  for (const b of SHELF_LIFE_BUCKETS) {
    const inRange = b.maxDays === null
      ? daysLeft >= b.minDays
      : daysLeft >= b.minDays && daysLeft <= b.maxDays
    if (inRange) return b.label
  }
  return '未分類'
}

function tokenizeKeywords(text: string): string[] {
  return text
    .replace(/[^\w\u4e00-\u9fff]+/g, ' ')
    .split(/\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 2 && !STOP_WORDS.has(s))
}

function emptyBucket(): MonthlyBucket {
  return {
    count: 0,
    city: {},
    product: {},
    productByMachine: {},
    machine: {},
    channel: {},
    status: {},
    cause: {},
    shelfLife: {},
    keywords: {}
  }
}

/** 單筆客訴資料（doc 或 Complaint 形狀） */
export type ComplaintLike = Record<string, unknown> & {
  reactionTime?: string | number
  expiryDate?: string | number
  city?: string
  productItem?: string
  manufacturingMachine?: string
  purchaseChannel?: string
  productStatus?: string
  causeAnalysis?: string
}

function ensureBucket(buckets: Record<string, MonthlyBucket>, key: string): MonthlyBucket {
  if (!buckets[key]) buckets[key] = emptyBucket()
  return buckets[key]
}

function addOneToMap(map: Record<string, number>, key: string) {
  const k = key || '未分類'
  map[k] = (map[k] ?? 0) + 1
}

function addComplaintToBucket(bucket: MonthlyBucket, c: ComplaintLike) {
  bucket.count += 1
  const city = (c.city as string) || '未分類'
  const product = (c.productItem as string) || '未分類'
  const machine = (c.manufacturingMachine as string) || '未分類'
  const channel = normalizeChannel((c.purchaseChannel as string) || '')
  const status = (c.productStatus as string) || '未分類'
  const cause = (c.causeAnalysis as string) || '未分類'
  const shelfLabel = getShelfLifeLabel(c.reactionTime, c.expiryDate)

  addOneToMap(bucket.city, city)
  addOneToMap(bucket.product, product)
  addOneToMap(bucket.machine, machine)
  addOneToMap(bucket.channel, channel)
  addOneToMap(bucket.status, status)
  addOneToMap(bucket.cause, cause)
  addOneToMap(bucket.shelfLife, shelfLabel)

  if (!bucket.productByMachine[machine]) bucket.productByMachine[machine] = {}
  addOneToMap(bucket.productByMachine[machine], product)

  const text = (c.causeAnalysis as string) || ''
  if (text.trim()) {
    for (const t of tokenizeKeywords(text)) {
      bucket.keywords[t] = (bucket.keywords[t] ?? 0) + 1
    }
  }
}

/** 防止多個請求同時觸發重建 */
let rebuildPromise: Promise<void> | null = null

/**
 * 確保 statistics/dashboard 存在且有資料；若不存在或為空則自動從 complaints 重算並寫入。
 * 取得資料後第一次請求 stats 時會自動觸發，無需手動按鈕。
 */
async function ensureStatsDoc(db: Firestore): Promise<void> {
  if (rebuildPromise) return rebuildPromise
  rebuildPromise = calculateStatsFromScratch(db).finally(() => {
    rebuildPromise = null
  })
  return rebuildPromise
}

/** 從頭計算所有客訴並寫入 statistics/dashboard（一次性或 fallback 用） */
export async function calculateStatsFromScratch(db: Firestore): Promise<void> {
  const buckets: Record<string, MonthlyBucket> = {}
  let lastDoc: DocumentSnapshot | null = null

  // eslint-disable-next-line no-constant-condition
  while (true) {
    let q = db.collection(COMPLAINTS_COLLECTION).orderBy('reactionTime').limit(MAX_FIRESTORE_READ)
    if (lastDoc) q = q.startAfter(lastDoc)
    const snap = await q.get()
    if (snap.empty) break

    for (const doc of snap.docs) {
      const data = doc.data() as ComplaintLike
      const key = getBucketKey(data.reactionTime as string)
      if (!key) continue
      const bucket = ensureBucket(buckets, key)
      addComplaintToBucket(bucket, data)
    }
    lastDoc = snap.docs[snap.docs.length - 1]
    if (snap.docs.length < MAX_FIRESTORE_READ) break
  }

  const payload: DashboardData = {
    lastUpdated: new Date().toISOString(),
    buckets
  }
  await db.doc(STATS_DOC_PATH).set(payload)
}

/** 新增多筆客訴後，僅更新受影響月份的 bucket */
export async function updateStatsIncrementally(db: Firestore, newComplaints: ComplaintLike[]): Promise<void> {
  if (newComplaints.length === 0) return

  const ref = db.doc(STATS_DOC_PATH)
  const snap = await ref.get()
  const data = snap.exists ? (snap.data() as DashboardData) : { lastUpdated: '', buckets: {} }
  const buckets = { ...(data.buckets || {}) }

  for (const c of newComplaints) {
    const key = getBucketKey(c.reactionTime as string)
    if (!key) continue
    const bucket = ensureBucket(buckets, key)
    addComplaintToBucket(bucket, c)
  }

  await ref.set({
    lastUpdated: new Date().toISOString(),
    buckets
  })
}

/** 合併多個 bucket 為單一 ComplaintStats，並轉成前端用的排序陣列 */
export async function getAggregatedStats(
  db: Firestore,
  startDate: string,
  endDate: string
): Promise<ComplaintStats> {
  const ref = db.doc(STATS_DOC_PATH)
  let snap = await ref.get()
  let data = snap.exists ? (snap.data() as DashboardData) : { lastUpdated: '', buckets: {} }
  // 若統計檔不存在或為空，自動從 complaints 重算並寫入，再讀一次（預設直接顯示圖表，無需手動按鈕）
  if (!data.buckets || Object.keys(data.buckets).length === 0) {
    await ensureStatsDoc(db)
    snap = await ref.get()
    data = snap.exists ? (snap.data() as DashboardData) : { lastUpdated: '', buckets: {} }
  }
  const buckets = data.buckets || {}

  const startYM = startDate.slice(0, 7)
  const endYM = endDate.slice(0, 7)
  const merged = emptyBucket()

  for (const [ym, b] of Object.entries(buckets)) {
    if (ym < startYM || ym > endYM) continue
    merged.count += b.count
    for (const [k, v] of Object.entries(b.city)) merged.city[k] = (merged.city[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.product)) merged.product[k] = (merged.product[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.machine)) merged.machine[k] = (merged.machine[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.channel)) merged.channel[k] = (merged.channel[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.status)) merged.status[k] = (merged.status[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.cause)) merged.cause[k] = (merged.cause[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.shelfLife)) merged.shelfLife[k] = (merged.shelfLife[k] ?? 0) + v
    for (const [k, v] of Object.entries(b.keywords)) merged.keywords[k] = (merged.keywords[k] ?? 0) + v
    for (const [machine, prodMap] of Object.entries(b.productByMachine)) {
      if (!merged.productByMachine[machine]) merged.productByMachine[machine] = {}
      for (const [prod, v] of Object.entries(prodMap)) {
        merged.productByMachine[machine][prod] = (merged.productByMachine[machine][prod] ?? 0) + v
      }
    }
  }

  const cityStats = Object.entries(merged.city)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
  const productStats = Object.entries(merged.product)
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
  const machineStats = Object.entries(merged.machine)
    .map(([machine, count]) => ({ machine, count }))
    .sort((a, b) => b.count - a.count)
  const channelStats = Object.entries(merged.channel)
    .map(([channel, count]) => ({ channel, count }))
    .sort((a, b) => b.count - a.count)
  const statusStats = Object.entries(merged.status)
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => b.count - a.count)
  const causeStats = Object.entries(merged.cause)
    .map(([cause, count]) => ({ cause, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const monthKeys = Object.keys(buckets).filter(ym => ym >= startYM && ym <= endYM).sort()
  const monthlyStats = monthKeys.map(month => ({
    month,
    count: buckets[month]?.count ?? 0
  }))

  const productStatsByMachine: Record<string, Array<{ product: string; count: number }>> = {}
  for (const [machine, prodMap] of Object.entries(merged.productByMachine)) {
    productStatsByMachine[machine] = Object.entries(prodMap)
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
  }

  let cum = 0
  const paretoProduct: ParetoStats = {
    total: merged.count,
    items: Object.entries(merged.product)
      .sort((a, b) => b[1] - a[1])
      .map(([item, count]) => {
        cum += count
        return {
          item,
          count,
          cumulativePercentage: merged.count > 0 ? Math.round((cum / merged.count) * 10000) / 100 : 0
        }
      })
  }
  cum = 0
  const paretoCause: ParetoStats = {
    total: merged.count,
    items: Object.entries(merged.cause)
      .sort((a, b) => b[1] - a[1])
      .map(([item, count]) => {
        cum += count
        return {
          item,
          count,
          cumulativePercentage: merged.count > 0 ? Math.round((cum / merged.count) * 10000) / 100 : 0
        }
      })
  }

  const shelfLife: ShelfLifeStats = {
    total: Object.values(merged.shelfLife).reduce((a, b) => a + b, 0),
    buckets: Object.entries(merged.shelfLife).map(([bucket, count]) => ({ bucket, count }))
  }

  const keywordStats: KeywordStats = {
    keywords: Object.entries(merged.keywords)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  return {
    total: merged.count,
    cityStats,
    productStats,
    productStatsByMachine,
    machineStats,
    channelStats,
    statusStats,
    monthlyStats,
    causeStats,
    paretoProduct,
    paretoCause,
    shelfLife,
    resolutionTimeDays: null,
    keywordStats
  }
}
