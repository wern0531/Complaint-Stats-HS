import { getFirebaseAdmin } from '~/server/utils/firebase'

const COMPLAINTS_COLLECTION = 'complaints'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    setResponseStatus(event, 400)
    return { success: false, message: '缺少文件 id' }
  }

  try {
    const { db } = getFirebaseAdmin(event)
    const docRef = db.collection(COMPLAINTS_COLLECTION).doc(id)

    const snapshot = await docRef.get()
    if (!snapshot.exists) {
      setResponseStatus(event, 404)
      return { success: false, message: '找不到該筆客訴' }
    }

    await docRef.delete()

    return {
      success: true,
      message: '客訴已刪除'
    }
  } catch (error) {
    console.error('刪除客訴失敗:', error)
    setResponseStatus(event, 500)
    return {
      success: false,
      message: '刪除客訴失敗，請稍後再試'
    }
  }
})
