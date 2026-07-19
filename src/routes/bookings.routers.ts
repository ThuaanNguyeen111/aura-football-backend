import { Router } from 'express'
import {
  createBookingController,
  getBusyTimeSlotsController,
  getMyBookingHistoryController,
  mockPaymentController,
  cancelBookingController,
  checkInBookingController,
  rescheduleBookingController,
  createRescheduleRequestController,
  cancelRescheduleRequestController
} from '~/controllers/bookings.controllers'
import {
  getBusySlotsValidator,
  createBookingValidator,
  cancelBookingValidator,
  rescheduleBookingValidator,
  createRescheduleRequestValidator,
  cancelRescheduleRequestValidator
} from '~/middlewares/bookings.middlewares'
import { accessTokenValidator, adminValidator } from '~/middlewares/users.middlewares'
import { WarpAsync } from '~/utils/handlers'

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

// [POST] /bookings/reschedule-request - Khách gửi yêu cầu dời lịch (Chờ admin xác nhận)
bookingsRouter.post(
  '/reschedule-request',
  accessTokenValidator,
  createRescheduleRequestValidator,
  WarpAsync(createRescheduleRequestController)
)

// [POST] /bookings/reschedule-request/cancel - Khách hủy yêu cầu dời lịch đang chờ duyệt
bookingsRouter.post(
  '/reschedule-request/cancel',
  accessTokenValidator,
  cancelRescheduleRequestValidator,
  WarpAsync(cancelRescheduleRequestController)
)

// [POST] /bookings/reschedule - Dời lịch đặt sân (Trực tiếp - legacy)
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
  adminValidator,
  WarpAsync(checkInBookingController)
)
export default bookingsRouter
