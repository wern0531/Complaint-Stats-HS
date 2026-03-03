/**
 * Excel 匯入 API
 * - 使用動態 import('xlsx-fixed') 避免載入失敗時無回應；alias 配合 Nuxt 解決 Windows 路徑問題
 * - 解析所有工作表，依客訴編號去重，略過摘要列與右側統計表
 */
import { getFirebaseAdmin } from '~/server/utils/firebase'
import { updateStatsIncrementally } from '~/server/utils/statsHelper'
import { clearRequestCache } from '~/server/utils/requestCache'
import admin from 'firebase-admin'

const COMPLAINTS_COLLECTION = 'complaints'
const BATCH_SIZE = 500

/** 欄位對應：Complaint 欄位 -> Excel 表頭別名（支援 反應/反映 等不一致） */
const HEADER_ALIASES: Record<string, string[]> = {
  complaintNumber: ['客訴編號'],
  productItem: ['產品品項'],
  manufacturingMachine: ['製造機台'],
  expiryDate: ['有效日期'],
  consumerReactionPoint: ['消費者反應點', '消費者反映點'],
  reactionTime: ['反應時間', '反映時間'],
  productStatus: ['產品狀態'],
  storagePeriodMonths: ['已存放時間 (月)', '已存放時間(月)', '已存放時間（月）'],
  departmentReply: ['相關單位回覆'],
  causeAnalysis: ['原因分析'],
  distributor: ['經銷商'],
  regionAddress: ['區域縣市'],
  city: ['縣市'],
  consumer: ['消費者'],
  purchaseChannel: ['購買通路']
}

/** 視為摘要列、略過不匯入的「客訴編號」內容 */
const SUMMARY_VALUES = new Set([
  '合計', '小計', '總計', '合計:', '小計:', '總計:',
  '合計：', '小計：', '總計：', 'Subtotal', 'Total'
])

function normalizeHeader(h: unknown): string {
  return (h != null ? String(h) : '').replace(/\s+/g, ' ').trim()
}

function toComplaintField(header: string): string | null {
  const normalized = normalizeHeader(header)
  if (!normalized) return null
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((a) => normalizeHeader(a) === normalized)) return field
  }
  return null
}

/** 8 位數整數 (20240115)、Excel 序列日期、或字串 → YYYYMMDD 字串，供 Firestore 與前端一致 */
function parseDateToYmd(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'number') {
    const n = Math.floor(value)
    // 8 位數 YYYYMMDD 格式
    if (n >= 19000101 && n <= 21001231) return String(n)
    // Excel 序列日期（約 1954–2064 年對應 20000–60000）
    if (n >= 20000 && n <= 60000) {
      const date = new Date(Math.round((n - 25569) * 86400 * 1000))
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const d = date.getDate()
      return `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`
    }
    return String(n)
  }
  if (typeof value === 'string') {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 8) return cleaned.slice(0, 8)
    return value.trim() || ''
  }
  return String(value)
}

function toStr(value: unknown): string {
  if (value == null) return ''
  return String(value).trim()
}

function toNum(value: unknown): number {
  if (value == null) return 0
  const n = Number(value)
  return Number.isNaN(n) ? 0 : Math.floor(n)
}

/** 是否為有效資料列（有客訴編號且非摘要） */
function isValidComplaintNumber(val: string): boolean {
  const s = toStr(val)
  if (!s) return false
  if (SUMMARY_VALUES.has(s)) return false
  return true
}

/** 由一列 + 欄位對應組出 Firestore 文件；無效列回傳 null */
function rowToDoc(
  row: Record<string, unknown>,
  colMap: Record<string, string>
): Record<string, unknown> | null {
  const rawNum = row[colMap.complaintNumber] ?? row['客訴編號']
  const complaintNumber = toStr(rawNum)
  if (!isValidComplaintNumber(complaintNumber)) return null

  const get = (field: string): unknown => {
    const key = colMap[field]
    return key != null ? row[key] : undefined
  }

  const expiryDate = parseDateToYmd(get('expiryDate'))
  const reactionTime = parseDateToYmd(get('reactionTime'))

  return {
    complaintNumber,
    productItem: toStr(get('productItem')),
    manufacturingMachine: toStr(get('manufacturingMachine')),
    expiryDate,
    consumerReactionPoint: toStr(get('consumerReactionPoint')),
    reactionTime: reactionTime || expiryDate,
    productStatus: toStr(get('productStatus')),
    storagePeriodMonths: toNum(get('storagePeriodMonths')),
    departmentReply: toStr(get('departmentReply')),
    causeAnalysis: toStr(get('causeAnalysis')),
    distributor: toStr(get('distributor')),
    regionAddress: toStr(get('regionAddress')),
    city: toStr(get('city')),
    consumer: toStr(get('consumer')),
    purchaseChannel: toStr(get('purchaseChannel')),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }
}

/** 從第一列建立「Complaint 欄位名 -> 該表實際表頭 key」對應（表頭可能含空格/全形） */
function buildColMap(headerRow: Record<string, unknown>): Record<string, string> {
  const colMap: Record<string, string> = {}
  for (const key of Object.keys(headerRow)) {
    // 使用 key（表頭名稱，如「有效日期」），不要用 headerRow[key]（儲存格值，如 "20240101"）
    const field = toComplaintField(key)
    if (field) colMap[field] = key
  }
  return colMap
}

/** 取得 sheet 的列資料：第一列為表頭，其餘為資料列（key 為表頭字串） */
function getSheetRows(XLSX: { utils: { sheet_to_json: (s: unknown, o?: object) => Record<string, unknown>[] } }, sheet: unknown): Record<string, unknown>[] {
  return XLSX.utils.sheet_to_json(sheet as never, {
    raw: false,
    defval: '',
    blankrows: false
  })
}

function fail(event: import('h3').H3Event, status: number, message: string, errors: string[] = []) {
  setResponseStatus(event, status)
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  return { success: false, message, added: 0, skipped: 0, errors: errors.length ? errors : [message] }
}

export default defineEventHandler(async (event) => {
  try {
    let form: Awaited<ReturnType<typeof readMultipartFormData>>
    try {
      form = await readMultipartFormData(event)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('readMultipartFormData error:', msg)
      return fail(event, 400, '無法解析上傳資料，請確認檔案大小與格式', [msg])
    }

    const file = form?.find((f) => f.name === 'file')
    if (!file?.data) {
      return fail(event, 400, '未收到檔案', [])
    }

    let XLSX: { read: (data: Buffer | ArrayBuffer, opts: { type: string; cellDates: boolean }) => { SheetNames: string[]; Sheets: Record<string, unknown> }; utils: { sheet_to_json: (s: unknown, o?: object) => Record<string, unknown>[] } }
    try {
      const mod = await import('xlsx-fixed')
      XLSX = (mod?.default ?? mod) as typeof XLSX
      if (!XLSX?.read || !XLSX?.utils?.sheet_to_json) throw new Error('xlsx 模組 API 不完整')
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('xlsx-fixed load error:', msg)
      return fail(event, 500, 'Excel 解析模組載入失敗', [msg])
    }

    const workbook = XLSX.read(file.data, { type: 'buffer', cellDates: false })
    const { db } = getFirebaseAdmin(event)

    const allDocs: { complaintNumber: string; doc: Record<string, unknown> }[] = []
    const seenNumbers = new Set<string>()

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      if (!sheet) continue

      const rows = getSheetRows(XLSX, sheet)
      if (rows.length < 1) continue

      const firstRow = rows[0] as Record<string, unknown>
      const colMap = buildColMap(firstRow)
      if (!colMap.complaintNumber) continue

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i] as Record<string, unknown>
        const doc = rowToDoc(row, colMap)
        if (!doc) continue
        const num = toStr(doc.complaintNumber)
        if (!num || seenNumbers.has(num)) continue
        seenNumbers.add(num)
        allDocs.push({ complaintNumber: num, doc })
      }
    }

    const toAdd = allDocs
    const existingSet = new Set<string>()
    const IN_CHUNK = 10
    for (let i = 0; i < toAdd.length; i += IN_CHUNK) {
      const chunk = toAdd.slice(i, i + IN_CHUNK).map((d) => d.complaintNumber)
      const snap = await db
        .collection(COMPLAINTS_COLLECTION)
        .where('complaintNumber', 'in', chunk)
        .get()
      snap.docs.forEach((d) => {
        const cn = d.data()?.complaintNumber
        if (cn != null) existingSet.add(String(cn))
      })
    }

    const toInsert = toAdd.filter((d) => !existingSet.has(d.complaintNumber))
    const skipped = toAdd.length - toInsert.length
    let added = 0

    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const slice = toInsert.slice(i, i + BATCH_SIZE)
      for (const { doc } of slice) {
        const ref = db.collection(COMPLAINTS_COLLECTION).doc()
        batch.set(ref, doc)
      }
      await batch.commit()
      added += slice.length
    }

    const allNewComplaints = toInsert.map(({ doc }) => doc)
    if (allNewComplaints.length > 0) {
      await updateStatsIncrementally(db, allNewComplaints)
    }
    clearRequestCache()

    return {
      success: true,
      message: `匯入完成：新增 ${added} 筆，略過（已存在）${skipped} 筆`,
      added,
      skipped,
      errors: undefined
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Import error:', error)
    setResponseStatus(event, 500)
    setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
    return {
      success: false,
      message: '匯入失敗',
      added: 0,
      skipped: 0,
      errors: [msg]
    }
  }
})
