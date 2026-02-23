import type { Complaint, ComplaintFilter } from '~/types/complaint'
import { mockData } from '~/server/data/mockData'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    
    // 使用 mockData 作為資料來源
    const mockDataArray = [...mockData] as Complaint[]
    
    // 解析篩選參數
    const filters: ComplaintFilter = {
      month: query.month as string,
      city: query.city as string,
      product: query.product as string,
      machine: query.machine as string,
      channel: query.channel as string,
      status: query.status as string,
      startDate: query.startDate as string,
      endDate: query.endDate as string,
      sortBy: query.sortBy as string || 'createdAt',
      sortOrder: query.sortOrder as string || 'desc'
    }
    
    // 篩選資料
    let filteredComplaints = [...mockDataArray] as Complaint[]
    
    // 月份篩選
    if (filters.month) {
      if (filters.month.includes('~')) {
        // 月份範圍篩選
        const [startMonth, endMonth] = filters.month.split('~').map(m => parseInt(m))
        filteredComplaints = filteredComplaints.filter(complaint => {
          const complaintMonth = parseInt(complaint.reactionTime?.slice(4, 6) || '0')
          return complaintMonth >= startMonth && complaintMonth <= endMonth
        })
      } else {
        // 單月份篩選
        const month = parseInt(filters.month)
        filteredComplaints = filteredComplaints.filter(complaint => {
          const complaintMonth = parseInt(complaint.reactionTime?.slice(4, 6) || '0')
          return complaintMonth === month
        })
      }
    }
    
    // 縣市篩選
    if (filters.city && filters.city !== '全部') {
      filteredComplaints = filteredComplaints.filter(complaint => 
        complaint.city === filters.city
      )
    }
    
    // 產品篩選
    if (filters.product && filters.product !== '全部') {
      filteredComplaints = filteredComplaints.filter(complaint => 
        complaint.productItem === filters.product
      )
    }
    
    // 機台篩選
    if (filters.machine && filters.machine !== '全部') {
      filteredComplaints = filteredComplaints.filter(complaint => 
        complaint.manufacturingMachine === filters.machine
      )
    }
    
    // 通路篩選
    if (filters.channel && filters.channel !== '全部') {
      filteredComplaints = filteredComplaints.filter(complaint => 
        complaint.purchaseChannel === filters.channel
      )
    }
    
    // 狀態篩選
    if (filters.status && filters.status !== '全部') {
      filteredComplaints = filteredComplaints.filter(complaint => 
        complaint.productStatus === filters.status
      )
    }
    
    // 日期範圍篩選
    if (filters.startDate && filters.endDate) {
      filteredComplaints = filteredComplaints.filter(complaint => {
        const complaintDate = complaint.reactionTime
        return complaintDate >= filters.startDate! && complaintDate <= filters.endDate!
      })
    }
    
    // 排序
    if (filters.sortBy) {
      filteredComplaints.sort((a, b) => {
        let aValue: any = a[filters.sortBy as keyof Complaint]
        let bValue: any = b[filters.sortBy as keyof Complaint]
        
        // 處理日期排序
        if (filters.sortBy === 'createdAt' || filters.sortBy === 'updatedAt') {
          aValue = new Date(aValue || 0).getTime()
          bValue = new Date(bValue || 0).getTime()
        }
        
        // 處理數字排序
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue
        }
        
        // 處理字串排序
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (filters.sortOrder === 'desc') {
            return bValue.localeCompare(aValue, 'zh-TW')
          } else {
            return aValue.localeCompare(bValue, 'zh-TW')
          }
        }
        
        return 0
      })
    }
    
    // 分頁處理（可選）
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 100
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedComplaints = filteredComplaints.slice(startIndex, endIndex)
    
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

