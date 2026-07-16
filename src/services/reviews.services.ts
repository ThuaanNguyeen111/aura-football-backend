import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import Review from '~/models/schema/reviews.schemas'
import { BookingStatus } from '~/constants/enums'
import { CreateReviewReqBody } from '~/models/request/reviews.requests'

class ReviewServices {
  async createReview(user_id: string, payload: CreateReviewReqBody) {
    const bookingObjectId = new ObjectId(payload.booking_id)
    const userObjectId = new ObjectId(user_id)

    // 1. Kiểm tra vé có hợp lệ và đúng chính chủ không
    const booking = await databaseService.bookings.findOne({
      _id: bookingObjectId,
      user_id: userObjectId
    })

    if (!booking) throw new Error('Không tìm thấy vé hoặc bạn không có quyền đánh giá')

    // 2. Logic siêu chặt chẽ: Phải là vé Confirmed/Completed và thời gian đá đã qua
    const now = new Date()
    if (booking.status !== BookingStatus.Confirmed && booking.status !== BookingStatus.Completed) {
      throw new Error('Chỉ được phép đánh giá sân khi vé đã thanh toán thành công hoặc đã sử dụng')
    }

    if (booking.end_time > now && booking.status !== BookingStatus.Completed) {
      throw new Error('Trận đấu chưa kết thúc. Vui lòng quay lại đánh giá sau khi đá xong nhé!')
    }

    // 3. Chống Spam: Mỗi vé chỉ được đánh giá 1 lần
    const existingReview = await databaseService.reviews.findOne({ booking_id: bookingObjectId })
    if (existingReview) {
      throw new Error('Bạn đã đánh giá cho suất đá này rồi')
    }

    // 4. Lưu đánh giá vào hệ thống
    const newReview = new Review({
      user_id: userObjectId,
      field_id: booking.field_id,
      booking_id: bookingObjectId,
      rating: payload.rating,
      comment: payload.comment || ''
    })

    await databaseService.reviews.insertOne(newReview)

    return {
      message: 'Cảm ơn bạn đã đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.',
      review: newReview
    }
  }
  async getFieldReviews(field_id: string) {
    // Dùng Aggregate để nối bảng Reviews -> Bookings -> Users
    const reviews = await databaseService.reviews
      .aggregate([
        { $match: { is_hidden: { $ne: true } } }, // Bỏ qua bình luận bị Admin ẩn
        {
          $lookup: {
            from: process.env.DB_BOOKINGS_COLLECTION as string,
            localField: 'booking_id',
            foreignField: '_id',
            as: 'booking_info'
          }
        },
        { $unwind: '$booking_info' },
        { $match: { 'booking_info.field_id': new ObjectId(field_id) } }, // Lọc đúng sân
        {
          $lookup: {
            from: process.env.DB_USERS_COLLECTION as string,
            localField: 'booking_info.user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        { $unwind: '$user_info' },
        {
          $project: {
            rating: 1,
            comment: 1,
            admin_reply: 1,
            created_at: 1,
            'user_info.name': 1 // Chỉ lấy tên để bảo mật
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    return reviews
  }
}

const reviewServices = new ReviewServices()
export default reviewServices
