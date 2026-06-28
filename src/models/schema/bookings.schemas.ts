import { ObjectId } from 'mongodb'
import { BookingStatus, PaymentMethod } from '~/constants/enums'

interface BookingType {
  _id?: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  locked_field_ids: ObjectId[]
  start_time: Date
  end_time: Date
  base_price: number
  discount_amount?: number
  final_price: number
  status?: BookingStatus
  payment_method: PaymentMethod // 🔥 Bổ sung thêm dòng này
  payment_link_id?: string
  created_at?: Date
  updated_at?: Date
}

export default class Booking {
  _id?: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  locked_field_ids: ObjectId[]
  start_time: Date
  end_time: Date
  base_price: number
  discount_amount: number
  final_price: number
  status: BookingStatus
  payment_method: PaymentMethod // 🔥 Bổ sung thêm dòng này
  payment_link_id: string
  created_at: Date
  updated_at: Date

  constructor(booking: BookingType) {
    const now = new Date()
    this._id = booking._id || new ObjectId()
    this.user_id = booking.user_id
    this.field_id = booking.field_id
    this.locked_field_ids = booking.locked_field_ids
    this.start_time = booking.start_time
    this.end_time = booking.end_time
    this.base_price = booking.base_price
    this.discount_amount = booking.discount_amount || 0
    this.final_price = booking.final_price
    this.status = booking.status !== undefined ? booking.status : BookingStatus.Pending
    this.payment_method = booking.payment_method
    this.payment_link_id = booking.payment_link_id || ''
    this.created_at = booking.created_at || now
    this.updated_at = booking.updated_at || now
  }
}
