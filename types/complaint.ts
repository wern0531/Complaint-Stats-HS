// 客訴資料結構定義
export interface Complaint {
  /** Firestore 文件 ID（與 _id 同義，列表 API 回傳 _id） */
  id?: string;
  _id?: string;
  complaintNumber: string;           // 客訴編號
  productItem: string;               // 產品品項
  manufacturingMachine: string;      // 製造機台
  expiryDate: string;                // 有效日期
  consumerReactionPoint: string;     // 消費者反映點
  reactionTime: string;              // 反映時間
  productStatus: string;             // 產品狀態
  storagePeriodMonths: number;       // 已存放時間(月)
  departmentReply: string;           // 相關單位回覆
  causeAnalysis: string;             // 原因分析
  distributor: string;               // 經銷商
  regionAddress: string;             // 區域縣市(詳細地址)
  city: string;                      // 縣市
  consumer: string;                  // 消費者
  purchaseChannel: string;           // 購買通路
  trackNumber?: string;              // 軌數
  quantity?: number;                 // 件數
  percentage?: number;               // 百分比
  totalQuantity?: number;            // 總件數
  storageMonths?: string;            // 存放月數
  complaintQuantity?: number;        // 客訴件數
  complaintPercentage?: number;      // 百分比.1
  cumulativePercentage?: number;     // 累計百分比
  createdAt?: string;
  updatedAt?: string;
}

// 客訴統計數據
export interface ComplaintStats {
  total: number;
  cityStats: Array<{ city: string; count: number }>;
  productStats: Array<{ product: string; count: number }>;
  machineStats: Array<{ machine: string; count: number }>;
  channelStats: Array<{ channel: string; count: number }>;
  statusStats: Array<{ status: string; count: number }>;
  monthlyStats: Array<{ month: string; count: number }>;
}

// 篩選條件
export interface ComplaintFilter {
  month?: string;
  city?: string;
  product?: string;
  machine?: string;
  channel?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

// 搜尋篩選參數
export interface SearchFilters {
  complaintNumber?: string;
  productCategory?: string;
  manufacturingMachine?: string;
  consumer?: string;
  region?: string;
  city?: string;
  startDate?: string;
  endDate?: string;
}

// API 回應格式
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

