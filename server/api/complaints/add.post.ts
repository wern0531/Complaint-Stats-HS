import type { Complaint } from '~/types/complaint'
import { mockData } from '~/server/data/mockData'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // 使用 mockData 作為資料來源
    let realComplaints = [...mockData] as Complaint[]
    
    // 驗證必填欄位
    if (!body.complaintNumber || !body.productItem || !body.consumerReactionPoint) {
      return {
        success: false,
        message: '客訴編號、產品品項和消費者反映點為必填欄位'
      }
    }
    
    // 檢查客訴編號是否已存在
    const existingComplaint = realComplaints.find(
      (complaint: Complaint) => complaint.complaintNumber === body.complaintNumber
    )
    
    if (existingComplaint) {
      return {
        success: false,
        message: '客訴編號已存在，請使用不同的編號'
      }
    }
    
    // 創建新的客訴記錄
    const newComplaint: Complaint = {
      _id: body.complaintNumber,
      complaintNumber: body.complaintNumber,
      productItem: body.productItem,
      manufacturingMachine: body.manufacturingMachine || '未知',
      expiryDate: body.expiryDate || '',
      consumerReactionPoint: body.consumerReactionPoint,
      reactionTime: body.reactionTime || new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      productStatus: body.productStatus || '未知',
      storagePeriodMonths: body.storagePeriodMonths || 0,
      departmentReply: body.departmentReply || '',
      causeAnalysis: body.causeAnalysis || '',
      distributor: body.distributor || '',
      regionAddress: body.regionAddress || '',
      city: body.city || '未知',
      consumer: body.consumer || '未知',
      purchaseChannel: body.purchaseChannel || '未知',
      trackNumber: body.trackNumber || '',
      quantity: body.quantity || 1,
      percentage: body.percentage || 0,
      totalQuantity: body.totalQuantity || 0,
      storageMonths: body.storageMonths || '',
      complaintQuantity: body.complaintQuantity || 1,
      complaintPercentage: body.complaintPercentage || 0,
      cumulativePercentage: body.cumulativePercentage || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // 添加到數據中
    realComplaints.push(newComplaint)
    
    // 注意：在 serverless 環境中，無法持久化保存資料
    // 這裡只是模擬新增功能，實際生產環境應該使用數據庫
    
    return {
      success: true,
      message: '客訴新增成功',
      data: newComplaint
    }
    
  } catch (error) {
    console.error('新增客訴失敗:', error)
    return {
      success: false,
      message: '新增客訴失敗，請稍後再試'
    }
  }
})

