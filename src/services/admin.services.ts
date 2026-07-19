import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { BookingStatus, PaymentMethod } from '~/constants/enums'
import { UpdateFieldReqBody } from '~/models/request/admin.requests'
import Field from '~/models/schema/fields.schemas'
import { UserVerifyStatus } from '~/constants/enums'
import Booking from '~/models/schema/bookings.schemas'
class AdminServices {
  // 1. Lấy danh sách toàn bộ vé trong ngày (Cho Staff trực quầy)
  async getDailyBookings(date: string) {
    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)

    const bookings = await databaseService.bookings
      .aggregate([
        {
          $match: {
            start_time: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed, BookingStatus.Completed] }
          }
        },
        {
          $lookup: {
            from: process.env.DB_USERS_COLLECTION as string,
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        {
          $lookup: {
            from: process.env.DB_FIELDS_COLLECTION as string,
            localField: 'field_id',
            foreignField: '_id',
            as: 'field_info'
          }
        },
        { $unwind: '$user_info' },
        { $unwind: '$field_info' },
        {
          $project: {
            locked_field_ids: 0,
            'user_info.password': 0,
            'user_info.forgot_password_token': 0,
            'field_info.linked_field_ids': 0
          }
        },
        { $sort: { start_time: 1 } }
      ])
      .toArray()

    return bookings
  }

  // 2. Hủy vé khẩn cấp & Hoàn 100% tiền (Cho Admin)
  async forceCancelBooking(booking_id: string, reason: string) {
    const bookingObjectId = new ObjectId(booking_id)
    const booking = await databaseService.bookings.findOne({ _id: bookingObjectId })

    if (!booking) throw new Error('Không tìm thấy vé đặt sân')
    if (booking.status === BookingStatus.Cancelled) throw new Error('Vé này đã bị hủy từ trước')

    // Hoàn 100% tiền nếu vé đã thanh toán
    if (booking.status === BookingStatus.Confirmed || booking.status === BookingStatus.Completed) {
      await databaseService.users.updateOne({ _id: booking.user_id }, { $inc: { wallet_balance: booking.final_price } })
    }

    await databaseService.bookings.updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          status: BookingStatus.Cancelled,
          updated_at: new Date()
        }
      }
    )

    return { message: `Đã hủy vé khẩn cấp thành công. Lý do: ${reason}. Hệ thống đã hoàn 100% tiền cho khách.` }
  }

  // 3. Thống kê doanh thu theo giai đoạn (Cho Admin)
  async getRevenue(startDate: string, endDate: string) {
    const start = new Date(`${startDate}T00:00:00.000Z`)
    const end = new Date(`${endDate}T23:59:59.999Z`)

    const revenueData = await databaseService.bookings
      .aggregate([
        {
          $match: {
            created_at: { $gte: start, $lte: end },
            status: { $in: [BookingStatus.Confirmed, BookingStatus.Completed] }
          }
        },
        {
          $group: {
            _id: '$payment_method',
            total_revenue: { $sum: '$final_price' },
            total_bookings: { $sum: 1 }
          }
        }
      ])
      .toArray()

    // Định dạng lại kết quả trả về cho Front-end dễ đọc
    let cashRevenue = 0
    let transferRevenue = 0
    let totalBookings = 0

    revenueData.forEach((item) => {
      totalBookings += item.total_bookings
      if (item._id === 0) cashRevenue += item.total_revenue // Cash
      if (item._id === 1) transferRevenue += item.total_revenue // Transfer
    })

    return {
      total_revenue: cashRevenue + transferRevenue,
      cash_revenue: cashRevenue,
      transfer_revenue: transferRevenue,
      total_bookings: totalBookings
    }
  }

  // 4. Chỉnh sửa thông tin sân (Khóa sân, cập nhật giá)
  async updateField(field_id: string, payload: UpdateFieldReqBody) {
    const result = await databaseService.fields.findOneAndUpdate(
      { _id: new ObjectId(field_id) },
      {
        $set: {
          ...payload,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (!result) throw new Error('Không tìm thấy sân bóng')
    return result
  }
  async createField(payload: any) {
    const newField = new Field({
      ...payload,
      // Đảm bảo tọa độ được map chuẩn form
      location: {
        type: 'Point',
        coordinates: [Number(payload.lng || 0), Number(payload.lat || 0)]
      }
    })
    await databaseService.fields.insertOne(newField)
    return newField
  }

  // DELETE: Ẩn sân (Không xóa cứng để giữ lịch sử vé)
  async deleteField(field_id: string) {
    const result = await databaseService.fields.findOneAndUpdate(
      { _id: new ObjectId(field_id) },
      {
        $set: { is_active: false, updated_at: new Date() }
      },
      { returnDocument: 'after' }
    )
    if (!result) throw new Error('Không tìm thấy sân bóng')
    return { message: 'Đã ẩn sân bóng thành công!' }
  }

  // 1. Lấy danh sách toàn bộ khách hàng (ẩn đi mật khẩu để bảo mật)
  async getAllUsers() {
    const users = await databaseService.users
      .find({}, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } })
      .sort({ created_at: -1 })
      .toArray()

    return users
  }

  // 2. Khóa (Ban) hoặc Mở khóa (Unban) tài khoản
  async toggleBanUser(user_id: string) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

    if (!user) throw new Error('Không tìm thấy tài khoản người dùng này!')

    // Nếu user đang bị khóa (Banned) -> Đổi thành Đã xác thực (Verified) để mở khóa
    // Nếu user đang bình thường -> Đổi thành Banned để khóa mõm
    const newStatus = user.verify === UserVerifyStatus.Banned ? UserVerifyStatus.Verified : UserVerifyStatus.Banned

    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { verify: newStatus, updated_at: new Date() } }
    )

    const message =
      newStatus === UserVerifyStatus.Banned ? 'Đã KHÓA tài khoản thành công!' : 'Đã MỞ KHÓA tài khoản thành công!'

    return { message, new_status: newStatus }
  }
  async replyReview(review_id: string, reply_text: string) {
    const result = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      { $set: { admin_reply: reply_text, updated_at: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) throw new Error('Không tìm thấy đánh giá')
    return { message: 'Đã trả lời đánh giá thành công!', result }
  }

  // Ẩn đánh giá toxic
  async hideReview(review_id: string) {
    const result = await databaseService.reviews.findOneAndUpdate(
      { _id: new ObjectId(review_id) },
      { $set: { is_hidden: true, updated_at: new Date() } },
      { returnDocument: 'after' }
    )
    if (!result) throw new Error('Không tìm thấy đánh giá')
    return { message: 'Đã ẩn đánh giá này khỏi người dùng!', result }
  }
  // Admin ép lịch/tạo vé offline
  async createOfflineBooking(admin_id: string, payload: any) {
    const { field_id, start_time, end_time, customer_name, customer_phone } = payload
    const startTime = new Date(start_time)
    const endTime = new Date(end_time)

    const field = await databaseService.fields.findOne({ _id: new ObjectId(field_id) })
    if (!field) throw new Error('Sân bóng không tồn tại')

    // Check trùng lịch y hệt luồng của User
    const lockedIds = [field._id, ...(field.linked_field_ids || [])]
    const isOverlap = await databaseService.bookings.findOne({
      locked_field_ids: { $in: lockedIds },
      status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
      $or: [
        { start_time: { $lt: endTime, $gte: startTime } },
        { end_time: { $gt: startTime, $lte: endTime } },
        { start_time: { $lte: startTime }, end_time: { $gte: endTime } }
      ]
    })
    if (isOverlap) throw new Error('Khung giờ này đã bị kẹt lịch!')

    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const base_price = durationHours * field.price_per_hour

    const newBooking = new Booking({
      user_id: new ObjectId(admin_id), // Dùng ID của Lễ tân để tra soát nguồn gốc vé
      field_id: field._id,
      locked_field_ids: lockedIds,
      start_time: startTime,
      end_time: endTime,
      base_price,
      discount_amount: 0,
      final_price: base_price,
      payment_method: PaymentMethod.Cash,
      status: BookingStatus.Confirmed // Vé ép lịch là auto Confirmed
    })

    // Ép thêm thông tin khách lẻ vào doc (Lợi thế của MongoDB)
    const offlineDoc = {
      ...newBooking,
      offline_info: { customer_name, customer_phone }
    }

    await databaseService.bookings.insertOne(offlineDoc as any)
    return offlineDoc
  }
}

const adminServices = new AdminServices()
export default adminServices
