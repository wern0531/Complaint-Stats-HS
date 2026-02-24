import type { Complaint } from '~/types/complaint'
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

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  try {
    const { db } = getFirebaseAdmin(event)
    let q: Query = db.collection(COMPLAINTS_COLLECTION)

    // 依 yearMonth 或 month 建立 Firestore 日期範圍查詢（可選）
    // Firestore 若 reactionTime 存成 number，查詢也用 number
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
      const monthFilter = query.month as string
      if (monthFilter.includes('~')) {
        const [startMonth, endMonth] = monthFilter.split('~').map((m) => parseInt(m, 10))
        // 月份範圍無法單用 Firestore 表示，先取一筆大範圍再於記憶體篩選
        q = q.limit(MAX_FIRESTORE_READ)
      } else {
        q = q.limit(MAX_FIRESTORE_READ)
      }
    }

    q = q.limit(MAX_FIRESTORE_READ)
    const snapshot = await q.get()
    let complaints: Complaint[] = snapshot.docs.map((doc) =>
      docToComplaint(doc.id, doc.data() as Record<string, unknown>)
    )

    // month 篩選（僅 month 參數時在記憶體做二次過濾）
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

    // 依 query 在記憶體篩選：縣市、產品、機台、通路（供地圖頁與統計篩選）
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

    // 縣市統計
    const cityMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const city = complaint.city || '未分類'
      cityMap.set(city, (cityMap.get(city) || 0) + 1)
    })
    const cityStats = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)

    // 產品品項統計
    const productMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const product = complaint.productItem || '未分類'
      productMap.set(product, (productMap.get(product) || 0) + 1)
    })
    const productStats = Array.from(productMap.entries())
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 製造機台統計
    const machineMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const machine = complaint.manufacturingMachine || '未分類'
      machineMap.set(machine, (machineMap.get(machine) || 0) + 1)
    })
    const machineStats = Array.from(machineMap.entries())
      .map(([machine, count]) => ({ machine, count }))
      .sort((a, b) => b.count - a.count)

    // 購買通路統計（保留 normalizeChannel）
    const channelMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const normalizedChannel = normalizeChannel(complaint.purchaseChannel)
      channelMap.set(normalizedChannel, (channelMap.get(normalizedChannel) || 0) + 1)
    })
    const channelStats = Array.from(channelMap.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)

    // 產品狀態統計
    const statusMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const status = complaint.productStatus || '未分類'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    const statusStats = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    // 異常原因分析
    const causeMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      const cause = complaint.causeAnalysis || '未分類'
      causeMap.set(cause, (causeMap.get(cause) || 0) + 1)
    })
    const causeStats = Array.from(causeMap.entries())
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 近 12 個月客訴數量
    const monthMap = new Map<string, number>()
    complaints.forEach((complaint) => {
      if (complaint.reactionTime && typeof complaint.reactionTime === 'string' && complaint.reactionTime.length >= 6) {
        const ym = `${complaint.reactionTime.slice(0, 4)}-${complaint.reactionTime.slice(4, 6)}`
        monthMap.set(ym, (monthMap.get(ym) || 0) + 1)
      }
    })
    const sortedMonths = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
    const last12 = sortedMonths.slice(-12)
    const monthlyStats = last12.length > 0 ? last12 : []

    const totalCount = complaints.length

    return {
      success: true,
      data: {
        total: totalCount,
        cityStats,
        productStats,
        machineStats,
        channelStats,
        statusStats,
        causeStats,
        monthlyStats
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
