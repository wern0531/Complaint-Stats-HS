import type { Complaint } from '~/types/complaint'
import { getFirebaseAdmin } from '~/server/utils/firebase'
import admin from 'firebase-admin'

const COMPLAINTS_COLLECTION = 'complaints'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    setResponseStatus(event, 400)
    return { success: false, message: '缺少文件 id' }
  }

  try {
    const body = await readBody(event) as Partial<Complaint>
    const { db } = getFirebaseAdmin(event)
    const docRef = db.collection(COMPLAINTS_COLLECTION).doc(id)

    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      setResponseStatus(event, 404)
      return { success: false, message: '找不到該筆客訴' }
    }

    const updateData: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    const allowed = [
      'complaintNumber', 'productItem', 'manufacturingMachine', 'expiryDate',
      'consumerReactionPoint', 'reactionTime', 'productStatus', 'storagePeriodMonths',
      'departmentReply', 'causeAnalysis', 'distributor', 'regionAddress',
      'city', 'consumer', 'purchaseChannel', 'trackNumber', 'quantity',
      'percentage', 'totalQuantity', 'storageMonths', 'complaintQuantity',
      'complaintPercentage', 'cumulativePercentage'
    ]
    for (const key of allowed) {
      if (body[key as keyof Complaint] !== undefined) {
        updateData[key] = body[key as keyof Complaint]
      }
    }

    await docRef.update(updateData)

    return {
      success: true,
      message: '客訴更新成功',
      data: { id, ...updateData }
    }
  } catch (error) {
    console.error('更新客訴失敗:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: '更新客訴失敗，請稍後再試'
    }
  }
})
