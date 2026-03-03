/**
 * 一次性重建統計：從 complaints 集合重算並寫入 statistics/dashboard。
 * 適用於：首次部署、匯入歷史資料後統計為空、或 statistics 與實際資料不一致時。
 * 注意：會消耗 Firestore 讀取（每 5000 筆約 5000 次 read），建議僅在必要時呼叫一次。
 */
import { getFirebaseAdmin } from '~/server/utils/firebase'
import { calculateStatsFromScratch } from '~/server/utils/statsHelper'

export default defineEventHandler(async (event) => {
  try {
    const { db } = getFirebaseAdmin(event)
    await calculateStatsFromScratch(db)
    return {
      success: true,
      message: '統計已從頭重建並寫入 statistics/dashboard，圖表與地圖應可正常顯示。'
    }
  } catch (error) {
    console.error('Rebuild stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '重建統計失敗'
    })
  }
})
