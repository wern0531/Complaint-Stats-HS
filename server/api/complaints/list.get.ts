import type { Complaint, ComplaintFilter } from '~/types/complaint'
import { getFirebaseAdmin } from '~/server/utils/firebase'
import { toIsoString, toReactionTimeString, toNumberOrString } from '~/server/utils/firestore-helpers'
import type { Query } from 'firebase-admin/firestore'

const COMPLAINTS_COLLECTION = 'complaints'
const MAX_FIRESTORE_READ = 3000

/** 前端送「台中市」、Firestore 存「台中」，查詢時統一成簡稱 */
function normalizeCityForQuery(city: string): string {
  if (!city) return city
  if (city.endsWith('市') || city.endsWith('縣')) return city.slice(0, -1)
  return city
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
  try {
    const query = getQuery(event)
    const { db } = getFirebaseAdmin(event)

    const filters: ComplaintFilter = {
      month: query.month as string,
      city: query.city as string,
      product: query.product as string,
      machine: query.machine as string,
      channel: query.channel as string,
      status: query.status as string,
      startDate: query.startDate as string,
      endDate: query.endDate as string,
      sortBy: (query.sortBy as string) || 'createdAt',
      sortOrder: (query.sortOrder as string) || 'desc'
    }

    let q: Query = db.collection(COMPLAINTS_COLLECTION)

    // 縣市、機台、通路、狀態：單選，可同時使用（例：台北市 + 7-11）
    if (filters.city && filters.city !== '全部') {
      q = q.where('city', '==', normalizeCityForQuery(filters.city))
    }
    // 產品關鍵字改為「名稱包含」比對，在取得資料後於記憶體篩選（Firestore 不支援 string contains）
    if (filters.machine && filters.machine !== '全部') {
      q = q.where('manufacturingMachine', '==', filters.machine)
    }
    if (filters.channel && filters.channel !== '全部') {
      q = q.where('purchaseChannel', '==', filters.channel)
    }
    if (filters.status && filters.status !== '全部') {
      q = q.where('productStatus', '==', filters.status)
    }

    // 日期範圍：Firestore 若存 number（如 20180615），查詢也用 number
    if (filters.startDate && filters.endDate) {
      const startNum = parseInt(filters.startDate.replace(/-/g, ''), 10)
      const endNum = parseInt(filters.endDate.replace(/-/g, ''), 10)
      if (!Number.isNaN(startNum) && !Number.isNaN(endNum)) {
        q = q.where('reactionTime', '>=', startNum).where('reactionTime', '<=', endNum)
      }
    }

    q = q.limit(MAX_FIRESTORE_READ)

    const snapshot = await q.get()
    if (snapshot.empty && process.env.NODE_ENV !== 'production') {
      console.warn('[list.get] Firestore 查詢結果為 0 筆，請確認：1) 集合名稱為 "complaints" 2) 環境變數 FIREBASE_* 是否正確 3) 篩選條件是否過嚴')
    }
    let filteredComplaints: Complaint[] = snapshot.docs.map((doc) =>
      docToComplaint(doc.id, doc.data() as Record<string, unknown>)
    )

    // 月份篩選（Firestore 無法單獨做月份範圍，改為 Server 端二次過濾）
    if (filters.month) {
      if (filters.month.includes('~')) {
        const [startMonth, endMonth] = filters.month.split('~').map((m) => parseInt(m, 10))
        filteredComplaints = filteredComplaints.filter((complaint) => {
          const complaintMonth = parseInt(complaint.reactionTime?.slice(4, 6) || '0', 10)
          return complaintMonth >= startMonth && complaintMonth <= endMonth
        })
      } else {
        const month = parseInt(filters.month, 10)
        filteredComplaints = filteredComplaints.filter((complaint) => {
          const complaintMonth = parseInt(complaint.reactionTime?.slice(4, 6) || '0', 10)
          return complaintMonth === month
        })
      }
    }

    // 產品品項關鍵字：名稱包含即符合（不區分大小寫，例：奶茶 → 奶茶吐司、鮮奶茶 等）
    const productKeyword = (filters.product || '').trim()
    if (productKeyword) {
      const lower = productKeyword.toLowerCase()
      filteredComplaints = filteredComplaints.filter((c) =>
        (c.productItem || '').toLowerCase().includes(lower)
      )
    }

    // 排序（記憶體排序以支援任意欄位）
    if (filters.sortBy) {
      filteredComplaints.sort((a, b) => {
        let aValue: unknown = a[filters.sortBy! as keyof Complaint]
        let bValue: unknown = b[filters.sortBy! as keyof Complaint]
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date((aValue as string) || 0).getTime()
          bValue = new Date((bValue as string) || 0).getTime()
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'desc'
            ? bValue.localeCompare(aValue, 'zh-TW')
            : aValue.localeCompare(bValue, 'zh-TW')
        }
        return 0
      })
    }

    const page = parseInt((query.page as string) || '1', 10)
    const limit = parseInt((query.limit as string) || '100', 10)
    const startIndex = (page - 1) * limit
    const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + limit)

    return {
      success: true,
      message: '獲取客訴資料成功',
      data: {
        complaints: paginatedComplaints,
        total: filteredComplaints.length,
        page,
        limit,
        totalPages: Math.ceil(filteredComplaints.length / limit)
      }
    }
  } catch (error) {
    console.error('獲取客訴資料失敗:', error)
    return {
      success: false,
      message: '獲取客訴資料失敗，請稍後再試',
      error: error instanceof Error ? error.message : '未知錯誤'
    }
  }
})
