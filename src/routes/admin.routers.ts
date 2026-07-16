import { Router } from 'express'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator, adminValidator } from '~/middlewares/users.middlewares'
import { getDailyBookingsValidator, revenueValidator, forceCancelValidator } from '~/middlewares/admin.middlewares'
import {
  getDailyBookingsController,
  getRevenueController,
  forceCancelBookingController,
  updateFieldController,
  createFieldController,
  deleteFieldController,
  getAllUsersController,
  toggleBanUserController,
  hideReviewController,
  replyReviewController,
  createOfflineBookingController
} from '~/controllers/admin.controllers'
import { createVoucherController } from '~/controllers/vouchers.controllers'

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
// [POST] /admin/bookings/offline - Lễ tân tạo vé thủ công
adminRouter.post('/bookings/offline', accessTokenValidator, adminValidator, WarpAsync(createOfflineBookingController))
// [GET] /admin/revenue - Admin thống kê báo cáo doanh thu theo mốc thời gian
adminRouter.get('/revenue', accessTokenValidator, adminValidator, revenueValidator, WarpAsync(getRevenueController))

// [PUT] /admin/fields/:field_id - Admin chỉnh sửa giá tiền hoặc trạng thái đóng/mở sân
adminRouter.put('/fields/:field_id', accessTokenValidator, adminValidator, WarpAsync(updateFieldController))
// [POST] /admin/fields - Admin tạo sân mới
adminRouter.post('/fields', accessTokenValidator, adminValidator, WarpAsync(createFieldController))

// [DELETE] /admin/fields/:field_id - Admin xóa/ẩn sân
adminRouter.delete('/fields/:field_id', accessTokenValidator, adminValidator, WarpAsync(deleteFieldController))
// [GET] /admin/users - Xem danh sách khách hàng
adminRouter.get('/users', accessTokenValidator, adminValidator, WarpAsync(getAllUsersController))

// [PUT] /admin/users/:user_id/ban - Khóa hoặc mở khóa tài khoản
adminRouter.put('/users/:user_id/ban', accessTokenValidator, adminValidator, WarpAsync(toggleBanUserController))

// [POST] /admin/reviews/:review_id/reply - Rep comment
adminRouter.post('/reviews/:review_id/reply', accessTokenValidator, adminValidator, WarpAsync(replyReviewController))
// [PUT] /admin/reviews/:review_id/hide - Ẩn comment
adminRouter.put('/reviews/:review_id/hide', accessTokenValidator, adminValidator, WarpAsync(hideReviewController))
// [POST] /admin/vouchers - Admin tạo mã giảm giá mới
adminRouter.post('/vouchers', accessTokenValidator, adminValidator, WarpAsync(createVoucherController))
export default adminRouter
