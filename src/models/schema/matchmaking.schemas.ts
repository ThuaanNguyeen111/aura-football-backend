import { ObjectId } from 'mongodb'

interface MatchmakingType {
  _id?: ObjectId
  user_id: ObjectId
  booking_id: ObjectId // Gắn liền với vé đã đặt
  level: string // Trình độ (Yếu, Trung Bình, Khá)
  message: string // Lời mời (VD: Cần giao lưu nhẹ nhàng ra mồ hôi)
  status?: number // 0: Đang tìm, 1: Đã chốt kèo, 2: Đã hủy
  created_at?: Date
}

export default class Matchmaking {
  _id: ObjectId
  user_id: ObjectId
  booking_id: ObjectId
  level: string
  message: string
  status: number
  created_at: Date

  constructor(match: MatchmakingType) {
    this._id = match._id || new ObjectId()
    this.user_id = match.user_id
    this.booking_id = match.booking_id
    this.level = match.level
    this.message = match.message
    this.status = match.status !== undefined ? match.status : 0
    this.created_at = match.created_at || new Date()
  }
}
