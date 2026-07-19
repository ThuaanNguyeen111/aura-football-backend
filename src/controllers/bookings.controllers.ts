import { Request, Response } from 'express'
import bookingServices from '~/services/bookings.services'
import { TokenPayload } from '~/models/request/user.requests'
import { ParamsDictionary } from 'express-serve-static-core'

import { RescheduleReqBody } from '~/models/request/bookings.requests'

export const getBusyTimeSlotsController = async (req: Request, res: Response) => {
  // Lấy dữ liệu từ URL Query (?field_id=...&date=...)
  const { field_id, date } = req.query as { field_id: string; date: string }

  const result = await bookingServices.getBusyTimeSlots(field_id, date)

  res.json({
    message: 'Lấy danh sách các khung giờ đã được đặt thành công',
    result
  })
}
export const createBookingController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as any // Lấy từ AccessToken
  const result = await bookingServices.createBooking(user_id, req.body)
  res.json({ message: 'Đặt sân thành công', result })
}

export const mockPaymentController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as any
  const { booking_id } = req.body
  const result = await bookingServices.mockPaymentSuccess(booking_id, user_id)
  res.json(result)
}

export const getMyBookingHistoryController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as any
  const result = await bookingServices.getMyBookingHistory(user_id)
  res.json({ message: 'Lấy lịch sử đặt sân thành công', result })
}
export const cancelBookingController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { booking_id } = req.body

  const result = await bookingServices.cancelBooking(user_id, booking_id)
  res.json(result)
}
// Thêm hàm Controller này vào cuối file
export const rescheduleBookingController = async (
  req: Request<ParamsDictionary, any, RescheduleReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload

  // Lúc này req.body được TypeScript hiểu 100% là RescheduleReqBody
  const result = await bookingServices.rescheduleBooking(user_id, req.body)

  res.json(result)
}
export const checkInBookingController = async (req: Request, res: Response) => {
  const { booking_id } = req.body
  const result = await bookingServices.checkInBooking(booking_id)
  res.json(result)
}

export const createRescheduleRequestController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await bookingServices.createRescheduleRequest(user_id, req.body)
  res.json(result)
}

export const cancelRescheduleRequestController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { request_id } = req.body
  const result = await bookingServices.cancelRescheduleRequest(user_id, request_id)
  res.json(result)
}
