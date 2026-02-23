import { z } from 'zod'

/**
 * 新增客訴時的請求 body 驗證 Schema（對應 Complaint 可傳入欄位）。
 * 必填：complaintNumber、productItem、consumerReactionPoint。
 */
export const complaintAddSchema = z.object({
  complaintNumber: z.string().min(1, '請填寫客訴編號'),
  productItem: z.string().min(1, '請填寫產品品項'),
  consumerReactionPoint: z.string().min(1, '請填寫消費者反映點'),
  manufacturingMachine: z.string().optional(),
  expiryDate: z.string().optional(),
  reactionTime: z.string().optional(),
  productStatus: z.string().optional(),
  storagePeriodMonths: z.coerce.number().optional(),
  departmentReply: z.string().optional(),
  causeAnalysis: z.string().optional(),
  distributor: z.string().optional(),
  regionAddress: z.string().optional(),
  city: z.string().optional(),
  consumer: z.string().optional(),
  purchaseChannel: z.string().optional(),
  trackNumber: z.string().optional(),
  quantity: z.coerce.number().optional(),
  percentage: z.coerce.number().optional(),
  totalQuantity: z.coerce.number().optional(),
  storageMonths: z.string().optional(),
  complaintQuantity: z.coerce.number().optional(),
  complaintPercentage: z.coerce.number().optional(),
  cumulativePercentage: z.coerce.number().optional()
})

export type ComplaintAddInput = z.infer<typeof complaintAddSchema>
