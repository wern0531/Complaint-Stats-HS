import { getFirebaseAdmin } from '~/server/utils/firebase'
import { getAggregatedStats } from '~/server/utils/statsHelper'
import { getCache, setCache } from '~/server/utils/requestCache'

/** 取得「全部區間」用於預設（讓歷史匯入資料也能顯示） */
const ALL_TIME_START = '2000-01-01'
const ALL_TIME_END = '2030-12-31'

/** 取得預設日期範圍：未傳則用「全部區間」，避免只顯示最近 12 個月導致歷史資料空白 */
function getDefaultDateRange(): { startDate: string; endDate: string } {
  return { startDate: ALL_TIME_START, endDate: ALL_TIME_END }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  let startDate = (query.startDate as string)?.trim()
  let endDate = (query.endDate as string)?.trim()

  if (!startDate || !endDate) {
    const def = getDefaultDateRange()
    startDate = startDate || def.startDate
    endDate = endDate || def.endDate
  }

  const cacheKey = `stats:${startDate}:${endDate}`
  const cached = getCache<{ success: true; data: unknown }>(cacheKey)
  if (cached) return cached

  try {
    const { db } = getFirebaseAdmin(event)
    const data = await getAggregatedStats(db, startDate, endDate)
    const response = { success: true as const, data }
    setCache(cacheKey, response)
    return response
  } catch (error) {
    console.error('Stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '統計資料查詢失敗'
    })
  }
})
