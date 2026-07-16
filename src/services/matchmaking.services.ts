import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Matchmaking from '~/models/schema/matchmaking.schemas'
import { BookingStatus } from '~/constants/enums'

class MatchmakingServices {
  // Đăng bài tìm đối thủ (Chỉ được đăng khi đã có vé Confirmed)
  async createMatch(user_id: string, payload: any) {
    const booking = await databaseService.bookings.findOne({
      _id: new ObjectId(payload.booking_id),
      user_id: new ObjectId(user_id),
      status: BookingStatus.Confirmed
    })

    if (!booking) throw new Error('Bạn phải đặt sân thành công mới được đăng bài cáp kèo!')

    const newMatch = new Matchmaking({
      user_id: new ObjectId(user_id),
      booking_id: booking._id,
      level: payload.level,
      message: payload.message
    })

    await databaseService.matchmakings.insertOne(newMatch)
    return newMatch
  }

  // Lấy danh sách các kèo đang Open (Kèm theo thông tin sân và giờ đá)
  async getOpenMatches() {
    const matches = await databaseService.matchmakings
      .aggregate([
        { $match: { status: 0 } },
        // Nối với bảng Bookings để lấy giờ đá
        {
          $lookup: {
            from: 'bookings', // Tên collection trong DB
            localField: 'booking_id',
            foreignField: '_id',
            as: 'booking_info'
          }
        },
        { $unwind: '$booking_info' },
        // Nối tiếp với bảng Users để lấy tên người đăng bài
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        { $unwind: '$user_info' },
        {
          $project: {
            'user_info.password': 0,
            'user_info.wallet_balance': 0 // Bảo mật data
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    return matches
  }
}
const matchmakingServices = new MatchmakingServices()
export default matchmakingServices
