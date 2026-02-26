import type { Complaint, ParetoStats, ShelfLifeStats, KeywordStats } from '~/types/complaint'
import { getFirebaseAdmin } from '~/server/utils/firebase'
import { toIsoString, toReactionTimeString, toNumberOrString } from '~/server/utils/firestore-helpers'
import type { Query } from 'firebase-admin/firestore'

const COMPLAINTS_COLLECTION = 'complaints'
const MAX_FIRESTORE_READ = 5000

// 網購平台關鍵字識別
const ONLINE_PLATFORM_KEYWORDS = [
  '酷澎', '酷膨', '酷彭', '酷鵬',
  'MOMO', 'momo',
  '蝦皮', '蝦皮商城',
  '線上家樂福', 'uber家樂福',
  '熊貓超市', 'foodpanda'
]

const isOnlinePlatform = (channel: string): boolean => {
  if (!channel) return false
  return ONLINE_PLATFORM_KEYWORDS.some(keyword =>
    channel.toLowerCase().includes(keyword.toLowerCase())
  )
}

const normalizeChannel = (channel: string): string => {
  if (!channel) return '未知'
  if (isOnlinePlatform(channel)) return '網購平台'
  const mainChannels = ['7-11', '萊爾富', '全家', 'OK', '家樂福', '全聯', '大潤發']
  for (const mainChannel of mainChannels) {
    if (channel.includes(mainChannel)) return mainChannel
  }
  return '其他'
}

function docToComplaint(id: string, data: Record<string, unknown>): Complaint {
  return {
    _id: id,
    complaintNumber: toNumberOrString(data.complaintNumber),
    productItem: (data.productItem as string) ?? '',
    manufacturingMachine: (data.manufacturingMachine as string) ?? '',
    expiryDate: toNumberOrString(data.expiryDate),
    consumerReactionPoint: (data.consumerReactionPoint as string) ?? '',
    reactionTime: toReactionTimeString(data.reactionTime),
    productStatus: (data.productStatus as string) ?? '',
    storagePeriodMonths: (data.storagePeriodMonths as number) ?? 0,
    departmentReply: (data.departmentReply as string) ?? '',
    causeAnalysis: (data.causeAnalysis as string) ?? '',
    distributor: (data.distributor as string) ?? '',
    regionAddress: (data.regionAddress as string) ?? '',
    city: (data.city as string) ?? '',
    consumer: (data.consumer as string) ?? '',
    purchaseChannel: (data.purchaseChannel as string) ?? '',
    trackNumber: data.trackNumber as string | undefined,
    quantity: data.quantity as number | undefined,
    percentage: data.percentage as number | undefined,
    totalQuantity: data.totalQuantity as number | undefined,
    storageMonths: data.storageMonths as string | undefined,
    complaintQuantity: data.complaintQuantity as number | undefined,
    complaintPercentage: data.complaintPercentage as number | undefined,
    cumulativePercentage: data.cumulativePercentage as number | undefined,
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt)
  }
}

// --- 日期與數值輔助（用於效期與結案天數） ---
/** 解析 YYYYMMDD 或 YYMMDD 為 Date */
function parseYmd(s: string): Date | null {
  if (!s || typeof s !== 'string') return null
  const raw = s.replace(/\D/g, '')
  if (raw.length === 8) {
    const y = parseInt(raw.slice(0, 4), 10)
    const m = parseInt(raw.slice(4, 6), 10) - 1
    const d = parseInt(raw.slice(6, 8), 10)
    const date = new Date(y, m, d)
    if (isNaN(date.getTime())) return null
    return date
  }
  if (raw.length === 6) {
    const y = 2000 + parseInt(raw.slice(0, 2), 10)
    const m = parseInt(raw.slice(2, 4), 10) - 1
    const d = parseInt(raw.slice(4, 6), 10)
    const date = new Date(y, m, d)
    if (isNaN(date.getTime())) return null
    return date
  }
  return null
}

/** 解析 ISO 字串或 YYYYMMDD */
function parseDate(value: string | undefined): Date | null {
  if (!value) return null
  if (value.includes('T') || value.includes('-')) {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  return parseYmd(value)
}

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.floor(ms / (24 * 60 * 60 * 1000))
}

// --- 柏拉圖：依 key 聚合後算累計百分比，依 count 降序 ---
function buildPareto(
  complaints: Complaint[],
  getKey: (c: Complaint) => string,
  fallbackLabel: string
): ParetoStats {
  const countByKey = new Map<string, number>()
  for (const c of complaints) {
    const key = getKey(c) || fallbackLabel
    countByKey.set(key, (countByKey.get(key) ?? 0) + 1)
  }
  const sorted = Array.from(countByKey.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
  const total = complaints.length
  let cum = 0
  const items = sorted.map(({ item, count }) => {
    cum += count
    return {
      item,
      count,
      cumulativePercentage: total > 0 ? Math.round((cum / total) * 10000) / 100 : 0
    }
  })
  return { items, total }
}

// --- 效期區間：以反映日為基準，計算距到期日天數並分桶 ---
const SHELF_LIFE_BUCKETS: Array<{ label: string; minDays: number; maxDays: number | null }> = [
  { label: '已過期', minDays: -Infinity, maxDays: -1 },
  { label: '0-3 個月內到期', minDays: 0, maxDays: 90 },
  { label: '3-6 個月內到期', minDays: 91, maxDays: 180 },
  { label: '6-12 個月內到期', minDays: 181, maxDays: 365 },
  { label: '12 個月以上', minDays: 366, maxDays: null }
]

function buildShelfLifeStats(complaints: Complaint[]): ShelfLifeStats {
  const bucketCounts = new Map<string, number>()
  for (const b of SHELF_LIFE_BUCKETS) bucketCounts.set(b.label, 0)
  let valid = 0
  for (const c of complaints) {
    const reaction = parseYmd(c.reactionTime)
    const expiry = parseDate(c.expiryDate) ?? parseYmd(c.expiryDate)
    if (!reaction || !expiry) continue
    const daysLeft = daysBetween(reaction, expiry)
    valid++
    for (const b of SHELF_LIFE_BUCKETS) {
      const inRange = b.maxDays === null
        ? daysLeft >= b.minDays
        : daysLeft >= b.minDays && daysLeft <= b.maxDays
      if (inRange) {
        bucketCounts.set(b.label, (bucketCounts.get(b.label) ?? 0) + 1)
        break
      }
    }
  }
  const buckets = SHELF_LIFE_BUCKETS.map(b => ({
    bucket: b.label,
    count: bucketCounts.get(b.label) ?? 0
  }))
  return { buckets, total: valid }
}

// --- 結案天數 KPI：reactionTime 到 updatedAt 的平均天數 ---
function buildResolutionTimeDays(complaints: Complaint[]): number | null {
  let sum = 0
  let n = 0
  for (const c of complaints) {
    const start = parseYmd(c.reactionTime)
    const end = parseDate(c.updatedAt)
    if (!start || !end) continue
    const days = daysBetween(start, end)
    if (days >= 0) {
      sum += days
      n++
    }
  }
  if (n === 0) return null
  return Math.round((sum / n) * 10) / 10
}

// --- 關鍵字頻率：從 causeAnalysis 切詞，排除停用詞，取前 20 ---
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '有', '与', '及', '等', '和', '或', '不', '也', '就', '都', '而', '被', '把', '让', '给', '为', '以',
  '与', '若', '如', '但', '因', '此', '由', '从', '到', '之', '未', '无', '没有', '可能', '可以', '进行', '相关', '问题', '分析', '原因',
  '與', '及', '等', '或', '和', '之', '與', '或', '若', '如', '但', '因', '此', '由', '從', '到', '未', '無', '沒有', '可能', '可以', '進行', '相關', '問題', '分析', '原因',
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'
])

function buildKeywordStats(complaints: Complaint[], topN: number = 20): KeywordStats {
  const freq = new Map<string, number>()
  const tokenize = (text: string): string[] => {
    return text
      .replace(/[^\w\u4e00-\u9fff]+/g, ' ')
      .split(/\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 2 && !STOP_WORDS.has(s))
  }
  for (const c of complaints) {
    const text = (c.causeAnalysis || '').trim()
    if (!text) continue
    const tokens = tokenize(text)
    for (const t of tokens) {
      freq.set(t, (freq.get(t) ?? 0) + 1)
    }
  }
  const keywords = Array.from(freq.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN)
  return { keywords }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const { db } = getFirebaseAdmin(event)
    let q: Query = db.collection(COMPLAINTS_COLLECTION)

    if (query.yearMonth) {
      const yearMonthFilter = query.yearMonth as string
      if (yearMonthFilter.includes('~')) {
        const [start, end] = yearMonthFilter.split('~')
        const startYear = parseInt(start.split('-')[0], 10)
        const startMonth = parseInt(start.split('-')[1], 10)
        const endYear = parseInt(end.split('-')[0], 10)
        const endMonth = parseInt(end.split('-')[1], 10)
        const startStr = `${startYear}${String(startMonth).padStart(2, '0')}01`
        const lastDay = new Date(endYear, endMonth, 0).getDate()
        const endStr = `${endYear}${String(endMonth).padStart(2, '0')}${String(lastDay).padStart(2, '0')}`
        q = q.where('reactionTime', '>=', parseInt(startStr, 10)).where('reactionTime', '<=', parseInt(endStr, 10))
      } else {
        const [targetYear, targetMonth] = yearMonthFilter.split('-').map((v) => parseInt(v, 10))
        const startStr = `${targetYear}${String(targetMonth).padStart(2, '0')}01`
        const lastDay = new Date(targetYear, targetMonth, 0).getDate()
        const endStr = `${targetYear}${String(targetMonth).padStart(2, '0')}${String(lastDay).padStart(2, '0')}`
        q = q.where('reactionTime', '>=', parseInt(startStr, 10)).where('reactionTime', '<=', parseInt(endStr, 10))
      }
    } else if (query.month) {
      q = q.limit(MAX_FIRESTORE_READ)
    }

    q = q.limit(MAX_FIRESTORE_READ)
    const snapshot = await q.get()
    let complaints: Complaint[] = snapshot.docs.map((doc) =>
      docToComplaint(doc.id, doc.data() as Record<string, unknown>)
    )

    if (query.month && !query.yearMonth) {
      const monthFilter = query.month as string
      if (monthFilter.includes('~')) {
        const [startMonth, endMonth] = monthFilter.split('~').map((m) => parseInt(m, 10))
        complaints = complaints.filter((complaint) => {
          if (complaint.reactionTime && complaint.reactionTime.length >= 6) {
            const month = parseInt(complaint.reactionTime.substring(4, 6), 10)
            return month >= startMonth && month <= endMonth
          }
          return false
        })
      } else {
        const targetMonth = parseInt(monthFilter, 10)
        complaints = complaints.filter((complaint) => {
          if (complaint.reactionTime && complaint.reactionTime.length >= 6) {
            const month = parseInt(complaint.reactionTime.substring(4, 6), 10)
            return month === targetMonth
          }
          return false
        })
      }
    }

    const filterCity = (query.city as string)?.trim()
    const filterProduct = (query.product as string)?.trim()
    const filterMachine = (query.machine as string)?.trim()
    const filterChannel = (query.channel as string)?.trim()
    if (filterCity) {
      const cityNorm = filterCity.endsWith('市') || filterCity.endsWith('縣') ? filterCity.slice(0, -1) : filterCity
      complaints = complaints.filter((c) => {
        const cCity = c.city || ''
        const cNorm = cCity.endsWith('市') || cCity.endsWith('縣') ? cCity.slice(0, -1) : cCity
        return cNorm === cityNorm || cCity === filterCity
      })
    }
    if (filterProduct) {
      complaints = complaints.filter((c) => (c.productItem || '').includes(filterProduct))
    }
    if (filterMachine) {
      complaints = complaints.filter((c) => (c.manufacturingMachine || '') === filterMachine)
    }
    if (filterChannel) {
      complaints = complaints.filter((c) => normalizeChannel(c.purchaseChannel) === filterChannel)
    }

    const totalCount = complaints.length

    const cityMap = new Map<string, number>()
    complaints.forEach((c) => {
      const city = c.city || '未分類'
      cityMap.set(city, (cityMap.get(city) || 0) + 1)
    })
    const cityStats = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    const productMap = new Map<string, number>()
    complaints.forEach((c) => {
      const product = c.productItem || '未分類'
      productMap.set(product, (productMap.get(product) || 0) + 1)
    })
    const productStats = Array.from(productMap.entries())
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 依製造機台分組的產品統計：machine -> [{ product, count }]，依 count 降序
    const productByMachine = new Map<string, Map<string, number>>()
    complaints.forEach((c) => {
      const machine = c.manufacturingMachine || '未分類'
      const product = c.productItem || '未分類'
      if (!productByMachine.has(machine)) productByMachine.set(machine, new Map())
      const pm = productByMachine.get(machine)!
      pm.set(product, (pm.get(product) || 0) + 1)
    })
    const productStatsByMachine: Record<string, Array<{ product: string; count: number }>> = {}
    productByMachine.forEach((pm, machine) => {
      productStatsByMachine[machine] = Array.from(pm.entries())
        .map(([product, count]) => ({ product, count }))
        .sort((a, b) => b.count - a.count)
    })

    const machineMap = new Map<string, number>()
    complaints.forEach((c) => {
      const machine = c.manufacturingMachine || '未分類'
      machineMap.set(machine, (machineMap.get(machine) || 0) + 1)
    })
    const machineStats = Array.from(machineMap.entries())
      .map(([machine, count]) => ({ machine, count }))
      .sort((a, b) => b.count - a.count)

    const channelMap = new Map<string, number>()
    complaints.forEach((c) => {
      const ch = normalizeChannel(c.purchaseChannel)
      channelMap.set(ch, (channelMap.get(ch) || 0) + 1)
    })
    const channelStats = Array.from(channelMap.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)

    const statusMap = new Map<string, number>()
    complaints.forEach((c) => {
      const status = c.productStatus || '未分類'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    const statusStats = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    const causeMap = new Map<string, number>()
    complaints.forEach((c) => {
      const cause = c.causeAnalysis || '未分類'
      causeMap.set(cause, (causeMap.get(cause) || 0) + 1)
    })
    const causeStats = Array.from(causeMap.entries())
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const monthMap = new Map<string, number>()
    complaints.forEach((c) => {
      if (c.reactionTime && typeof c.reactionTime === 'string' && c.reactionTime.length >= 6) {
        const ym = `${c.reactionTime.slice(0, 4)}-${c.reactionTime.slice(4, 6)}`
        monthMap.set(ym, (monthMap.get(ym) || 0) + 1)
      }
    })
    const sortedMonths = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
    const monthlyStats = sortedMonths.slice(-12)

    const paretoProduct = buildPareto(complaints, c => c.productItem || '', '未分類')
    const paretoCause = buildPareto(complaints, c => c.causeAnalysis || '', '未分類')
    const shelfLife = buildShelfLifeStats(complaints)
    const resolutionTimeDays = buildResolutionTimeDays(complaints)
    const keywordStats = buildKeywordStats(complaints, 20)

    return {
      success: true,
      data: {
        total: totalCount,
        cityStats,
        productStats,
        productStatsByMachine,
        machineStats,
        channelStats,
        statusStats,
        causeStats,
        monthlyStats,
        paretoProduct,
        paretoCause,
        shelfLife,
        resolutionTimeDays,
        keywordStats
      }
    }
  } catch (error) {
    console.error('Stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '統計資料查詢失敗'
    })
  }
})
