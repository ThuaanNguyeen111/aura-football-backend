import { ParsedQs } from 'qs' // 🔥 Đổi nguồn import sang thư viện qs

export interface GetDailyBookingsQuery extends ParsedQs {
  date: string
}

export interface RevenueQuery extends ParsedQs {
  start_date: string
  end_date: string
}

export interface ForceCancelReqBody {
  booking_id: string
  reason: string
}

export interface UpdateFieldReqBody {
  name?: string
  price_per_hour?: number
  is_active?: boolean
}
