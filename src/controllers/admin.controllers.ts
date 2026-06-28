import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import adminServices from '~/services/admin.services'
import {
  GetDailyBookingsQuery,
  RevenueQuery,
  ForceCancelReqBody,
  UpdateFieldReqBody
} from '~/models/request/admin.requests'

export const getDailyBookingsController = async (
  req: Request<ParamsDictionary, any, any, GetDailyBookingsQuery>,
  res: Response
) => {
  const result = await adminServices.getDailyBookings(req.query.date)
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
  const { start_date, end_date } = req.query
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
