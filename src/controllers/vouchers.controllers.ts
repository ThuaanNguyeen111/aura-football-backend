import { Request, Response } from 'express'
import voucherServices from '~/services/vouchers.services'

// Admin tạo mã giảm giá
export const createVoucherController = async (req: Request, res: Response) => {
  const result = await voucherServices.createVoucher(req.body)
  res.json({ message: 'Tạo mã giảm giá thành công', result })
}

// User kiểm tra mã giảm giá (Ép kiểu as string để tránh lỗi TS2345)
export const checkVoucherController = async (req: Request, res: Response) => {
  const code = req.query.code as string
  const base_price = parseFloat(req.query.base_price as string)

  if (!code || isNaN(base_price)) {
    throw new Error('Vui lòng cung cấp mã code và giá tiền hợp lệ')
  }

  const result = await voucherServices.checkVoucher(code, base_price)
  res.json({ message: 'Áp dụng mã giảm giá thành công', result })
}

// User lấy danh sách mã giảm giá khả dụng
export const getVouchersController = async (req: Request, res: Response) => {
  const result = await voucherServices.getVouchers()
  res.json({ message: 'Lấy danh sách mã giảm giá thành công', result })
}

// Admin lấy tất cả danh sách mã giảm giá
export const getAllVouchersAdminController = async (req: Request, res: Response) => {
  const result = await voucherServices.getAllVouchersAdmin()
  res.json({ message: 'Lấy toàn bộ danh sách mã giảm giá thành công', result })
}
