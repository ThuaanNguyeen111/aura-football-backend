import { ObjectId } from 'mongodb'

interface VoucherType {
  _id?: ObjectId
  code: string // VD: SUMMER20
  discount_percentage: number // VD: 20 (%)
  max_discount: number // Giảm tối đa (VD: 50000 VNĐ)
  expiration_date: Date // Hạn sử dụng
  usage_limit: number // Tổng số lượt dùng được phép (VD: 100)
  used_count?: number // Số lượt đã dùng
  is_active?: boolean
  created_at?: Date
}

export default class Voucher {
  _id: ObjectId
  code: string
  discount_percentage: number
  max_discount: number
  expiration_date: Date
  usage_limit: number
  used_count: number
  is_active: boolean
  created_at: Date

  constructor(voucher: VoucherType) {
    this._id = voucher._id || new ObjectId()
    this.code = voucher.code.toUpperCase()
    this.discount_percentage = voucher.discount_percentage
    this.max_discount = voucher.max_discount
    this.expiration_date = voucher.expiration_date
    this.usage_limit = voucher.usage_limit
    this.used_count = voucher.used_count || 0
    this.is_active = voucher.is_active !== undefined ? voucher.is_active : true
    this.created_at = voucher.created_at || new Date()
  }
}
