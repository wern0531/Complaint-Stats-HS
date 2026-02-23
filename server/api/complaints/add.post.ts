import type { Complaint } from '~/types/complaint'
import { getFirebaseAdmin } from '~/server/utils/firebase'
import { complaintAddSchema } from '~/server/utils/complaintSchema'
import admin from 'firebase-admin'

const COMPLAINTS_COLLECTION = 'complaints'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const parsed = complaintAddSchema.safeParse(body)

    if (!parsed.success) {
      const issues = parsed.error.issues
      const message = issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('；')
      setResponseStatus(event, 400)
      return {
        success: false,
        message: '資料驗證失敗',
        error: message,
        errors: issues.map((i) => ({ path: i.path.join('.'), message: i.message }))
      }
    }

    const data = parsed.data
    const { db } = getFirebaseAdmin(event)

    const existing = await db
      .collection(COMPLAINTS_COLLECTION)
      .where('complaintNumber', '==', data.complaintNumber)
      .limit(1)
      .get()

    if (!existing.empty) {
      setResponseStatus(event, 400)
      return {
        success: false,
        message: '客訴編號已存在，請使用不同的編號'
      }
    }

    const nowIso = new Date().toISOString()
    const docData = {
      complaintNumber: data.complaintNumber,
      productItem: data.productItem,
      manufacturingMachine: data.manufacturingMachine ?? '未知',
      expiryDate: data.expiryDate ?? '',
      consumerReactionPoint: data.consumerReactionPoint,
      reactionTime: data.reactionTime ?? new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      productStatus: data.productStatus ?? '未知',
      storagePeriodMonths: data.storagePeriodMonths ?? 0,
      departmentReply: data.departmentReply ?? '',
      causeAnalysis: data.causeAnalysis ?? '',
      distributor: data.distributor ?? '',
      regionAddress: data.regionAddress ?? '',
      city: data.city ?? '未知',
      consumer: data.consumer ?? '未知',
      purchaseChannel: data.purchaseChannel ?? '未知',
      trackNumber: data.trackNumber ?? '',
      quantity: data.quantity ?? 1,
      percentage: data.percentage ?? 0,
      totalQuantity: data.totalQuantity ?? 0,
      storageMonths: data.storageMonths ?? '',
      complaintQuantity: data.complaintQuantity ?? 1,
      complaintPercentage: data.complaintPercentage ?? 0,
      cumulativePercentage: data.cumulativePercentage ?? 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    const ref = await db.collection(COMPLAINTS_COLLECTION).add(docData)

    const newComplaint: Complaint = {
      _id: ref.id,
      complaintNumber: data.complaintNumber,
      productItem: data.productItem,
      manufacturingMachine: data.manufacturingMachine ?? '未知',
      expiryDate: data.expiryDate ?? '',
      consumerReactionPoint: data.consumerReactionPoint,
      reactionTime: data.reactionTime ?? new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      productStatus: data.productStatus ?? '未知',
      storagePeriodMonths: data.storagePeriodMonths ?? 0,
      departmentReply: data.departmentReply ?? '',
      causeAnalysis: data.causeAnalysis ?? '',
      distributor: data.distributor ?? '',
      regionAddress: data.regionAddress ?? '',
      city: data.city ?? '未知',
      consumer: data.consumer ?? '未知',
      purchaseChannel: data.purchaseChannel ?? '未知',
      trackNumber: data.trackNumber ?? '',
      quantity: data.quantity ?? 1,
      percentage: data.percentage ?? 0,
      totalQuantity: data.totalQuantity ?? 0,
      storageMonths: data.storageMonths ?? '',
      complaintQuantity: data.complaintQuantity ?? 1,
      complaintPercentage: data.complaintPercentage ?? 0,
      cumulativePercentage: data.cumulativePercentage ?? 0,
      createdAt: nowIso,
      updatedAt: nowIso
    }

    return {
      success: true,
      message: '客訴新增成功',
      data: newComplaint
    }
  } catch (error) {
    console.error('新增客訴失敗:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: '新增客訴失敗，請稍後再試'
    }
  }
})
