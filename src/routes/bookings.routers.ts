import { Router } from 'express'
import { getBusyTimeSlotsController } from '~/controllers/bookings.controllers'
import { getBusySlotsValidator } from '~/middlewares/bookings.middlewares'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { createBookingValidator } from '~/middlewares/bookings.middlewares'
import {
  createBookingController,
  getMyBookingHistoryController,
  mockPaymentController
} from '~/controllers/bookings.controllers'
import { cancelBookingValidator } from '~/middlewares/bookings.middlewares'
import { cancelBookingController } from '~/controllers/bookings.controllers'
import { checkInBookingController } from '~/controllers/bookings.controllers'
import { adminValidator } from '~/middlewares/users.middlewares'
import { rescheduleBookingValidator } from '~/middlewares/bookings.middlewares'
import { rescheduleBookingController } from '~/controllers/bookings.controllers'
const bookingsRouter = Router()

// [GET] /bookings/busy-slots?field_id=...&date=2026-06-28
bookingsRouter.get('/busy-slots', getBusySlotsValidator, WarpAsync(getBusyTimeSlotsController))
// [POST] /bookings - Đặt sân mới
bookingsRouter.post('/', accessTokenValidator, createBookingValidator, WarpAsync(createBookingController))

// [POST] /bookings/mock-payment - Giả lập thanh toán thành công
bookingsRouter.post('/mock-payment', accessTokenValidator, WarpAsync(mockPaymentController))

// [GET] /bookings/history - Lấy lịch sử vé (Render ra màn hình Lịch sử)
bookingsRouter.get('/history', accessTokenValidator, WarpAsync(getMyBookingHistoryController))

// [POST] /bookings/cancel - Hủy đặt sân & hoàn tiền ví nội bộ
bookingsRouter.post('/cancel', accessTokenValidator, cancelBookingValidator, WarpAsync(cancelBookingController))

// [POST] /bookings/reschedule - Dời lịch đặt sân sang khung giờ khác
bookingsRouter.post(
  '/reschedule',
  accessTokenValidator,
  rescheduleBookingValidator,
  WarpAsync(rescheduleBookingController)
)
// [POST] /bookings/check-in - Admin quét mã QR cho khách vào sân
bookingsRouter.post(
  '/check-in',
  accessTokenValidator,
  adminValidator, // 🔥 Đổi thành adminValidator
  WarpAsync(checkInBookingController)
)
export default bookingsRouter
