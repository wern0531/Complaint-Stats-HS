import type { Complaint } from '~/types/complaint'
import { mockData } from '~/server/data/mockData'

// 網購平台關鍵字識別
const ONLINE_PLATFORM_KEYWORDS = [
  '酷澎', '酷膨', '酷彭', '酷鵬',
  'MOMO', 'momo',
  '蝦皮', '蝦皮商城',
  '線上家樂福', 'uber家樂福',
  '熊貓超市', 'foodpanda'
]

// 判斷是否為網購平台
const isOnlinePlatform = (channel: string): boolean => {
  if (!channel) return false
  return ONLINE_PLATFORM_KEYWORDS.some(keyword => 
    channel.toLowerCase().includes(keyword.toLowerCase())
  )
}

// 標準化通路名稱
const normalizeChannel = (channel: string): string => {
  if (!channel) return '未知'
  if (isOnlinePlatform(channel)) return '網購平台'
  
  const mainChannels = ['7-11', '萊爾富', '全家', 'OK', '家樂福', '全聯', '大潤發']
  for (const mainChannel of mainChannels) {
    if (channel.includes(mainChannel)) return mainChannel
  }
  return '其他'
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  try {
    // 使用 mockData 作為資料來源
    let complaints = [...mockData] as Complaint[]
    
    // 年份+月份篩選邏輯
    if (query.yearMonth) {
      const yearMonthFilter = query.yearMonth as string
      if (yearMonthFilter.includes('~')) {
        // 範圍查詢 yyyy-MM~yyyy-MM
        const [start, end] = yearMonthFilter.split('~')
        const startYear = parseInt(start.split('-')[0])
        const startMonth = parseInt(start.split('-')[1])
        const endYear = parseInt(end.split('-')[0])
        const endMonth = parseInt(end.split('-')[1])
        complaints = complaints.filter(complaint => {
          if (complaint.reactionTime) {
            const reactionTimeStr = complaint.reactionTime.toString()
            if (reactionTimeStr.length === 8) {
              const year = parseInt(reactionTimeStr.substring(0, 4))
              const month = parseInt(reactionTimeStr.substring(4, 6))
              if (year > startYear && year < endYear) return true
              if (year === startYear && year === endYear) return month >= startMonth && month <= endMonth
              if (year === startYear) return month >= startMonth
              if (year === endYear) return month <= endMonth
            }
          }
          return false
        })
      } else {
        // 單一 yyyy-MM
        const [targetYear, targetMonth] = yearMonthFilter.split('-').map(v => parseInt(v))
        complaints = complaints.filter(complaint => {
          if (complaint.reactionTime) {
            const reactionTimeStr = complaint.reactionTime.toString()
            if (reactionTimeStr.length === 8) {
              const year = parseInt(reactionTimeStr.substring(0, 4))
              const month = parseInt(reactionTimeStr.substring(4, 6))
              return year === targetYear && month === targetMonth
            }
          }
          return false
        })
      }
    } else if (query.month) {
      // 保留原本 month 查詢方式
      const monthFilter = query.month as string
      if (monthFilter.includes('~')) {
        // 多月份範圍篩選 (例如: "2~5")
        const [startMonth, endMonth] = monthFilter.split('~').map(m => parseInt(m))
        complaints = complaints.filter(complaint => {
          if (complaint.reactionTime) {
            // 處理 YYYYMMDD 格式的日期
            const reactionTimeStr = complaint.reactionTime.toString()
            if (reactionTimeStr.length === 8) {
              const month = parseInt(reactionTimeStr.substring(4, 6))
              return month >= startMonth && month <= endMonth
            }
          }
          return false
        })
      } else {
        // 單月份篩選
        const targetMonth = parseInt(monthFilter)
        complaints = complaints.filter(complaint => {
          if (complaint.reactionTime) {
            // 處理 YYYYMMDD 格式的日期
            const reactionTimeStr = complaint.reactionTime.toString()
            if (reactionTimeStr.length === 8) {
              const month = parseInt(reactionTimeStr.substring(4, 6))
              return month === targetMonth
            }
          }
          return false
        })
      }
    }
    
    // 統計各縣市的客訴數量
    const cityMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const city = complaint.city || '未分類'
      cityMap.set(city, (cityMap.get(city) || 0) + 1)
    })
    
    const cityStats = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
    
    // 統計產品品項
    const productMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const product = complaint.productItem || '未分類'
      productMap.set(product, (productMap.get(product) || 0) + 1)
    })
    
    const productStats = Array.from(productMap.entries())
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // 統計製造機台
    const machineMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const machine = complaint.manufacturingMachine || '未分類'
      machineMap.set(machine, (machineMap.get(machine) || 0) + 1)
    })
    
    const machineStats = Array.from(machineMap.entries())
      .map(([machine, count]) => ({ machine, count }))
      .sort((a, b) => b.count - a.count)
    
    // 統計購買通路
    const channelMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const normalizedChannel = normalizeChannel(complaint.purchaseChannel)
      channelMap.set(normalizedChannel, (channelMap.get(normalizedChannel) || 0) + 1)
    })
    
    const channelStats = Array.from(channelMap.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
    
    // 統計產品狀態
    const statusMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const status = complaint.productStatus || '未分類'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })
    
    const statusStats = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)
    
    // 統計異常原因分析
    const causeMap = new Map<string, number>()
    complaints.forEach(complaint => {
      const cause = complaint.causeAnalysis || '未分類'
      causeMap.set(cause, (causeMap.get(cause) || 0) + 1)
    })
    const causeStats = Array.from(causeMap.entries())
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
    
    // 近 12 個月客訴數量（用於趨勢圖）
    const monthMap = new Map<string, number>()
    complaints.forEach(complaint => {
      if (complaint.reactionTime && typeof complaint.reactionTime === 'string') {
        const s = complaint.reactionTime
        if (s.length >= 6) {
          const ym = `${s.slice(0, 4)}-${s.slice(4, 6)}`
          monthMap.set(ym, (monthMap.get(ym) || 0) + 1)
        }
      }
    })
    const sortedMonths = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
    const last12 = sortedMonths.slice(-12)
    const monthlyStats = last12.length > 0 ? last12 : []
    
    // 總數統計
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
