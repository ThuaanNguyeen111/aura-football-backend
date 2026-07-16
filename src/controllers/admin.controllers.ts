import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import adminServices from '~/services/admin.services'
import {
  GetDailyBookingsQuery,
  RevenueQuery,
  ForceCancelReqBody,
  UpdateFieldReqBody
} from '~/models/request/admin.requests'
import { TokenPayload } from '~/models/request/user.requests'
export const createFieldController = async (req: Request, res: Response) => {
  const result = await adminServices.createField(req.body)
  res.json({ message: 'Tạo sân mới thành công', result })
}

export const deleteFieldController = async (req: Request<{ field_id: string }>, res: Response) => {
  const result = await adminServices.deleteField(req.params.field_id)
  res.json(result)
}

export const getDailyBookingsController = async (
  req: Request<ParamsDictionary, any, any, GetDailyBookingsQuery>,
  res: Response
) => {
  // 🔥 Ép kiểu "as string" để báo cho TypeScript biết chắc chắn đây là chuỗi
  const date = req.query.date as string

  const result = await adminServices.getDailyBookings(date)
  res.json({ message: 'Lấy lịch đặt sân thành công', result })
}

export const forceCancelBookingController = async (
  req: Request<ParamsDictionary, any, ForceCancelReqBody>,
  res: Response
) => {
  const { booking_id, reason } = req.body
  const result = await adminServices.forceCancelBooking(booking_id, reason)
  res.json(result)
}

export const getRevenueController = async (req: Request<ParamsDictionary, any, any, RevenueQuery>, res: Response) => {
  // 🔥 Ép kiểu "as string" tương tự để fix lỗi TS2345
  const start_date = req.query.start_date as string
  const end_date = req.query.end_date as string

  const result = await adminServices.getRevenue(start_date, end_date)
  res.json({ message: 'Thống kê doanh thu thành công', result })
}

export const updateFieldController = async (
  req: Request<{ field_id: string }, any, UpdateFieldReqBody>,
  res: Response
) => {
  const { field_id } = req.params
  const result = await adminServices.updateField(field_id, req.body)
  res.json({ message: 'Cập nhật sân thành công', result })
}
export const getAllUsersController = async (req: Request, res: Response) => {
  const result = await adminServices.getAllUsers()
  res.json({
    message: 'Lấy danh sách người dùng thành công',
    result
  })
}

// Bọc Request type để khai báo params có user_id dạng string (giống lỗi lúc nãy)
export const toggleBanUserController = async (req: Request<{ user_id: string }>, res: Response) => {
  const result = await adminServices.toggleBanUser(req.params.user_id)
  res.json(result)
}
export const replyReviewController = async (req: Request<{ review_id: string }>, res: Response) => {
  const result = await adminServices.replyReview(req.params.review_id, req.body.reply_text)
  res.json(result)
}

// Tương tự với hàm ẩn đánh giá
export const hideReviewController = async (req: Request<{ review_id: string }>, res: Response) => {
  const result = await adminServices.hideReview(req.params.review_id)
  res.json(result)
}

export const createOfflineBookingController = async (req: Request, res: Response) => {
  const tokenPayload = req.decode_authorization as TokenPayload
  const result = await adminServices.createOfflineBooking(tokenPayload.user_id, req.body)
  res.json({ message: 'Tạo vé Offline thành công', result })
}
