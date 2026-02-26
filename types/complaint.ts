// 縣市聯合類型（台灣縣市）
export type City =
  | '台北市'
  | '新北市'
  | '桃園市'
  | '台中市'
  | '台南市'
  | '高雄市'
  | '基隆市'
  | '新竹市'
  | '嘉義市'
  | '宜蘭縣'
  | '新竹縣'
  | '苗栗縣'
  | '彰化縣'
  | '南投縣'
  | '雲林縣'
  | '嘉義縣'
  | '屏東縣'
  | '澎湖縣'
  | '花蓮縣'
  | '台東縣'
  | '金門縣'
  | '連江縣'

// 產品狀態聯合類型（常見值，實際資料可能為其他字串則用 string 擴展）
export type ProductStatus =
  | '未開封'
  | '已開封'
  | '過期'
  | '變質'
  | '未分類'

// 客訴資料結構定義
export interface Complaint {
  /** Firestore 文件 ID（與 _id 同義，列表 API 回傳 _id） */
  id?: string
  _id?: string
  complaintNumber: string
  productItem: string
  manufacturingMachine: string
  expiryDate: string
  consumerReactionPoint: string
  reactionTime: string
  productStatus: string
  storagePeriodMonths: number
  departmentReply: string
  causeAnalysis: string
  distributor: string
  regionAddress: string
  city: string
  consumer: string
  purchaseChannel: string
  trackNumber?: string
  quantity?: number
  percentage?: number
  totalQuantity?: number
  storageMonths?: string
  complaintQuantity?: number
  complaintPercentage?: number
  cumulativePercentage?: number
  createdAt?: string
  updatedAt?: string
}

// 柏拉圖分析單筆：品項/原因 + 筆數 + 累計百分比
export interface ParetoItem {
  item: string
  count: number
  cumulativePercentage: number
}

export interface ParetoStats {
  items: ParetoItem[]
  total: number
}

// 效期區間（以反映當下為基準的剩餘效期）
export interface ShelfLifeBucket {
  bucket: string
  count: number
}

export interface ShelfLifeStats {
  buckets: ShelfLifeBucket[]
  total: number
}

// 關鍵字頻率
export interface KeywordItem {
  keyword: string
  count: number
}

export interface KeywordStats {
  keywords: KeywordItem[]
}

// 客訴統計數據（含進階分析）
export interface ComplaintStats {
  total: number
  cityStats: Array<{ city: string; count: number }>
  productStats: Array<{ product: string; count: number }>
  /** 依製造機台分組的產品統計，key 為機台名（如 P#13、P#15） */
  productStatsByMachine?: Record<string, Array<{ product: string; count: number }>>
  machineStats: Array<{ machine: string; count: number }>
  channelStats: Array<{ channel: string; count: number }>
  statusStats: Array<{ status: string; count: number }>
  monthlyStats: Array<{ month: string; count: number }>
  causeStats?: Array<{ cause: string; count: number }>
  paretoProduct?: ParetoStats
  paretoCause?: ParetoStats
  shelfLife?: ShelfLifeStats
  resolutionTimeDays?: number | null
  keywordStats?: KeywordStats
}

// 篩選條件
export interface ComplaintFilter {
  month?: string
  city?: string
  product?: string
  machine?: string
  channel?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: string
}

// 搜尋篩選參數
export interface SearchFilters {
  complaintNumber?: string
  productCategory?: string
  manufacturingMachine?: string
  consumer?: string
  region?: string
  city?: string
  startDate?: string
  endDate?: string
}

// API 回應格式
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
