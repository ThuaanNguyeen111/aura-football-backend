import { Router } from 'express'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator, adminValidator } from '~/middlewares/users.middlewares'
import { getDailyBookingsValidator, revenueValidator, forceCancelValidator } from '~/middlewares/admin.middlewares'
import {
  getDailyBookingsController,
  getRevenueController,
  forceCancelBookingController,
  updateFieldController
} from '~/controllers/admin.controllers'

const adminRouter = Router()

// Nhóm API Xem lịch đặt sân hàng ngày
adminRouter.get(
  '/bookings/daily',
  accessTokenValidator,
  adminValidator, // 🔥 Đổi thành adminValidator
  getDailyBookingsValidator,
  WarpAsync(getDailyBookingsController)
)

// [POST] /admin/bookings/force-cancel - Admin hủy vé khẩn cấp & hoàn tiền 100% vào ví
adminRouter.post(
  '/bookings/force-cancel',
  accessTokenValidator,
  adminValidator,
  forceCancelValidator,
  WarpAsync(forceCancelBookingController)
)

// [GET] /admin/revenue - Admin thống kê báo cáo doanh thu theo mốc thời gian
adminRouter.get('/revenue', accessTokenValidator, adminValidator, revenueValidator, WarpAsync(getRevenueController))

// [PUT] /admin/fields/:field_id - Admin chỉnh sửa giá tiền hoặc trạng thái đóng/mở sân
adminRouter.put('/fields/:field_id', accessTokenValidator, adminValidator, WarpAsync(updateFieldController))

export default adminRouter
