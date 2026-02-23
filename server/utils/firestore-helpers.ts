import type { Timestamp } from 'firebase-admin/firestore'

/**
 * Firestore 的 Timestamp 轉成 ISO 字串；已是字串或無值則原樣回傳。
 * 避免前端收到 Timestamp 物件導致顯示與 Firebase Console 不一致。
 */
export function toIsoString(value: unknown): string | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') return value
  const t = value as Timestamp
  if (typeof t?.toDate === 'function') return t.toDate().toISOString()
  return undefined
}

/**
 * 取得 reactionTime：若為 Timestamp 則轉成 YYYYMMDD，否則當字串回傳。
 */
export function toReactionTimeString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  const t = value as Timestamp
  if (typeof t?.toDate === 'function') {
    const d = t.toDate()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}${m}${day}`
  }
  return String(value)
}

/** Firestore 可能存成 number（如 180109、20180615），統一轉成字串給 API/前端 */
export function toNumberOrString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return String(value)
}
