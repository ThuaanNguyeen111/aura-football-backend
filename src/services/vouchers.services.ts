import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Voucher from '~/models/schema/vouchers.schemas'

class VoucherServices {
  // Dành cho Admin: Tạo mã giảm giá
  async createVoucher(payload: any) {
    const newVoucher = new Voucher({
      ...payload,
      expiration_date: new Date(payload.expiration_date)
    })
    await databaseService.vouchers.insertOne(newVoucher)
    return newVoucher
  }

  // Dành cho User: Kiểm tra mã lúc chuẩn bị đặt sân
  async checkVoucher(code: string, base_price: number) {
    const voucher = await databaseService.vouchers.findOne({ code: code.toUpperCase() })
    if (!voucher) throw new Error('Mã giảm giá không tồn tại')
    if (!voucher.is_active) throw new Error('Mã giảm giá đã bị vô hiệu hóa')
    if (voucher.used_count >= voucher.usage_limit) throw new Error('Mã giảm giá đã hết lượt sử dụng')
    if (new Date() > voucher.expiration_date) throw new Error('Mã giảm giá đã hết hạn')

    // Tính tiền giảm (Giảm theo % nhưng không vượt quá max_discount)
    let discount_amount = (base_price * voucher.discount_percentage) / 100
    if (discount_amount > voucher.max_discount) {
      discount_amount = voucher.max_discount
    }

    return {
      voucher_code: voucher.code,
      discount_amount,
      final_price: base_price - discount_amount
    }
  }

  // Lấy danh sách voucher còn hiệu lực cho Khách hàng (User)
  async getVouchers() {
    const now = new Date()
    const vouchers = await databaseService.vouchers
      .find({
        is_active: true,
        expiration_date: { $gte: now }
      })
      .sort({ created_at: -1 })
      .toArray()

    // Lọc các voucher chưa vượt quá số lượt dùng tối đa
    return vouchers.filter((v) => v.used_count < v.usage_limit)
  }

  // Admin lấy toàn bộ danh sách mã giảm giá
  async getAllVouchersAdmin() {
    const vouchers = await databaseService.vouchers.find({}).sort({ created_at: -1 }).toArray()
    return vouchers
  }
}
const voucherServices = new VoucherServices()
export default voucherServices
