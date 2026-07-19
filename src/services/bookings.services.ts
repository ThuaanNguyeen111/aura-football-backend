import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { BookingStatus, PaymentMethod, RescheduleStatus } from '~/constants/enums'
import Booking from '~/models/schema/bookings.schemas'
import RescheduleRequest from '~/models/schema/rescheduleRequests.schemas'
class BookingServices {
  //!=====================================================================================================
  async getBusyTimeSlots(field_id: string, date: string) {
    // 1. Chuẩn hóa chuỗi ngày (VD: '2026-06-28') thành mốc 0h00 và 23h59
    const startOfDay = new Date(`${date}T00:00:00.000Z`)
    const endOfDay = new Date(`${date}T23:59:59.999Z`)

    // 2. Truy vấn cốt lõi: Tìm tất cả các vé đang Hold (Pending) hoặc Đã thanh toán (Confirmed)
    const busyBookings = await databaseService.bookings
      .find({
        locked_field_ids: new ObjectId(field_id),
        status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
        $or: [
          // Bắt các vé có thời gian bắt đầu hoặc kết thúc cắt ngang qua ngày hôm nay
          { start_time: { $gte: startOfDay, $lte: endOfDay } },
          { end_time: { $gte: startOfDay, $lte: endOfDay } }
        ]
      })
      .project({ start_time: 1, end_time: 1, status: 1, _id: 0 }) // Chỉ lấy đúng 3 trường cần thiết, giấu ID vé đi
      .sort({ start_time: 1 }) // Sắp xếp giờ từ sáng đến tối
      .toArray()

    return busyBookings
  }
  //!=====================================================================================================
  async createBooking(user_id: string, payload: any) {
    const { field_id, start_time, end_time, payment_method } = payload
    const startTime = new Date(start_time)
    const endTime = new Date(end_time)

    // 1. Kiểm tra Sân bóng có tồn tại
    const field = await databaseService.fields.findOne({ _id: new ObjectId(field_id) })
    if (!field) throw new Error('Sân bóng không tồn tại')

    // 2. Chống Race Condition (Trùng lịch)
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

    if (isOverlap) {
      throw new Error('Rất tiếc, khung giờ này vừa có người khác đặt thành công. Vui lòng chọn khung giờ khác!')
    }

    // 3. Tính toán chi phí sắc bén theo Schema mới
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
    const base_price = durationHours * field.price_per_hour
    let discount_amount = 0

    // Kiểm tra xem khách đã từng có đơn Confirmed nào chưa
    const hasBooked = await databaseService.bookings.findOne({
      user_id: new ObjectId(user_id),
      status: BookingStatus.Confirmed
    })

    if (!hasBooked) {
      discount_amount = base_price * 0.2 // Khách mới: Giảm 20%
    }

    const final_price = base_price - discount_amount

    // 4. Quyết định trạng thái
    const status = payment_method === PaymentMethod.Cash ? BookingStatus.Confirmed : BookingStatus.Pending

    // 5. Lưu vào Database
    const newBooking = new Booking({
      user_id: new ObjectId(user_id),
      field_id: field._id,
      locked_field_ids: lockedIds,
      start_time: startTime,
      end_time: endTime,
      base_price,
      discount_amount,
      final_price,
      payment_method,
      status
    })

    await databaseService.bookings.insertOne(newBooking)
    return newBooking
  }
  //!=====================================================================================================
  // Khởi tạo luồng Mock Payment cho phương thức Chuyển khoản
  async mockPaymentSuccess(booking_id: string, user_id: string) {
    const booking = await databaseService.bookings.findOne({
      _id: new ObjectId(booking_id),
      user_id: new ObjectId(user_id)
    })

    if (!booking) throw new Error('Vé đặt sân không tồn tại')
    if (booking.status !== BookingStatus.Pending) throw new Error('Vé này không ở trạng thái chờ thanh toán')

    await databaseService.bookings.updateOne(
      { _id: new ObjectId(booking_id) },
      { $set: { status: BookingStatus.Confirmed, updated_at: new Date() } }
    )

    return { message: 'Thanh toán mô phỏng thành công, vé đã được xác nhận!' }
  }
  //!=====================================================================================================
  // Lấy lịch sử đặt sân của user (Aggregate để nối data Sân bóng)
  async getMyBookingHistory(user_id: string) {
    const history = await databaseService.bookings
      .aggregate([
        { $match: { user_id: new ObjectId(user_id) } },
        {
          $lookup: {
            from: process.env.DB_FIELDS_COLLECTION as string,
            localField: 'field_id',
            foreignField: '_id',
            as: 'field_info'
          }
        },
        { $unwind: '$field_info' }, // Gỡ mảng ra thành object
        { $sort: { created_at: -1 } }, // Xếp vé mới nhất lên đầu
        {
          $project: {
            locked_field_ids: 0, // Dấu các ID kỹ thuật đi
            'field_info.linked_field_ids': 0
          }
        }
      ])
      .toArray()

    return history
  }
  //!=====================================================================================================
  async cancelBooking(user_id: string, booking_id: string) {
    const bookingObjectId = new ObjectId(booking_id)
    const userObjectId = new ObjectId(user_id)

    // 1. Tìm vé đặt sân và kiểm tra quyền sở hữu
    const booking = await databaseService.bookings.findOne({
      _id: bookingObjectId,
      user_id: userObjectId
    })

    if (!booking) throw new Error('Không tìm thấy vé đặt sân hoặc bạn không có quyền hủy vé này')
    if (booking.status === BookingStatus.Cancelled) throw new Error('Vé này đã được hủy từ trước')

    // 2. Xử lý logic hoàn tiền dựa vào trạng thái vé hiện tại
    let refundAmount = 0
    let message = 'Hủy giữ chỗ thành công!'

    if (booking.status === BookingStatus.Confirmed) {
      // Phạt 10%, hoàn lại 90% trên số tiền final_price khách thực trả
      refundAmount = booking.final_price * 0.9
      message = `Hủy sân thành công! Bạn đã bị trừ 10% phí phạt. Số tiền 90% (${refundAmount.toLocaleString('vi-VN')} Đ) đã được hoàn vào ví nội bộ.`

      // Thực hiện cộng tiền vào ví của User trong database
      await databaseService.users.updateOne(
        { _id: userObjectId },
        {
          $inc: { wallet_balance: refundAmount },
          $set: { updated_at: new Date() }
        }
      )
    }

    // 3. Cập nhật trạng thái vé thành Cancelled để giải phóng sân ngay lập tức
    await databaseService.bookings.updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          status: BookingStatus.Cancelled,
          updated_at: new Date()
        }
      }
    )

    return {
      message,
      refund_amount: refundAmount,
      booking_id
    }
  }
  //!================================================================================================================

  // Thêm hàm này vào class BookingServices
  async rescheduleBooking(user_id: string, payload: { booking_id: string; start_time: string; end_time: string }) {
    const bookingObjectId = new ObjectId(payload.booking_id)
    const userObjectId = new ObjectId(user_id)
    const newStartTime = new Date(payload.start_time)
    const newEndTime = new Date(payload.end_time)

    // 1. Tìm vé đặt sân để đảm bảo vé này của đúng user đó
    const booking = await databaseService.bookings.findOne({
      _id: bookingObjectId,
      user_id: userObjectId
    })

    if (!booking) throw new Error('Không tìm thấy vé đặt sân hoặc bạn không có quyền thao tác')
    if (booking.status === BookingStatus.Cancelled) throw new Error('Không thể dời lịch cho vé đã bị hủy')

    // 2. CHỐNG TRÙNG LỊCH NÂNG CAO: Kiểm tra giờ mới có trống không
    const isOverlap = await databaseService.bookings.findOne({
      _id: { $ne: bookingObjectId }, // 🔥 CỰC KỲ QUAN TRỌNG: Bỏ qua chính vé đang muốn dời
      locked_field_ids: { $in: booking.locked_field_ids },
      status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
      $or: [
        { start_time: { $lt: newEndTime, $gte: newStartTime } },
        { end_time: { $gt: newStartTime, $lte: newEndTime } },
        { start_time: { $lte: newStartTime }, end_time: { $gte: newEndTime } }
      ]
    })

    if (isOverlap) {
      throw new Error('Khung giờ mới đã có người đặt hoặc bị trùng lặp. Vui lòng chọn khoảng thời gian khác!')
    }

    // 3. Thực hiện dời lịch (Cập nhật thời gian mới, giữ nguyên giá tiền theo rule)
    await databaseService.bookings.updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          start_time: newStartTime,
          end_time: newEndTime,
          updated_at: new Date()
        }
      }
    )

    return {
      message: 'Dời lịch sân thành công!',
      booking_id: payload.booking_id,
      new_start_time: newStartTime,
      new_end_time: newEndTime
    }
  }
  //!=======================================================================
  async checkInBooking(booking_id: string) {
    const bookingObjectId = new ObjectId(booking_id)

    const booking = await databaseService.bookings.findOne({ _id: bookingObjectId })
    if (!booking) throw new Error('Không tìm thấy vé trên hệ thống')

    if (booking.status !== BookingStatus.Confirmed) {
      throw new Error('Chỉ có thể Check-in cho vé đang ở trạng thái Đã thanh toán (Confirmed)')
    }

    await databaseService.bookings.updateOne(
      { _id: bookingObjectId },
      {
        $set: {
          status: BookingStatus.Completed,
          updated_at: new Date()
        }
      }
    )

    return { message: 'Check-in thành công! Khách hàng có thể vào sân.' }
  }

  //!=======================================================================
  // Khách hàng gửi yêu cầu dời lịch (Chờ Admin duyệt)
  async createRescheduleRequest(
    user_id: string,
    payload: { booking_id: string; start_time: string; end_time: string }
  ) {
    const bookingObjectId = new ObjectId(payload.booking_id)
    const userObjectId = new ObjectId(user_id)
    const newStartTime = new Date(payload.start_time)
    const newEndTime = new Date(payload.end_time)

    // 1. Kiểm tra vé thuộc user và chưa hủy / chưa hoàn thành
    const booking = await databaseService.bookings.findOne({
      _id: bookingObjectId,
      user_id: userObjectId
    })

    if (!booking) throw new Error('Không tìm thấy vé đặt sân hoặc bạn không có quyền thao tác')
    if (booking.status === BookingStatus.Cancelled) throw new Error('Không thể yêu cầu dời lịch cho vé đã bị hủy')
    if (booking.status === BookingStatus.Completed) throw new Error('Không thể yêu cầu dời lịch cho vé đã hoàn thành')

    // 2. Kiểm tra xem đã có yêu cầu dời lịch nào đang chờ duyệt (Pending) cho booking này không
    const existingPending = await databaseService.rescheduleRequests.findOne({
      booking_id: bookingObjectId,
      status: RescheduleStatus.Pending
    })
    if (existingPending) {
      throw new Error('Vé này đã có yêu cầu dời lịch đang chờ xác nhận. Vui lòng chờ Admin xử lý!')
    }

    // 3. Kiểm tra trùng lịch với các booking khác trên cùng hệ thống sân
    const isOverlap = await databaseService.bookings.findOne({
      _id: { $ne: bookingObjectId },
      locked_field_ids: { $in: booking.locked_field_ids },
      status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
      $or: [
        { start_time: { $lt: newEndTime, $gte: newStartTime } },
        { end_time: { $gt: newStartTime, $lte: newEndTime } },
        { start_time: { $lte: newStartTime }, end_time: { $gte: newEndTime } }
      ]
    })

    if (isOverlap) {
      throw new Error('Khung giờ mới đã có người đặt hoặc bị trùng lặp. Vui lòng chọn khoảng thời gian khác!')
    }

    // 4. Tạo yêu cầu dời lịch với status = Pending (0)
    const newRequest = new RescheduleRequest({
      booking_id: bookingObjectId,
      user_id: userObjectId,
      field_id: booking.field_id,
      old_start_time: booking.start_time,
      old_end_time: booking.end_time,
      new_start_time: newStartTime,
      new_end_time: newEndTime,
      status: RescheduleStatus.Pending
    })

    await databaseService.rescheduleRequests.insertOne(newRequest)

    return {
      message: 'Đã gửi yêu cầu dời lịch, vui lòng chờ admin xác nhận',
      result: newRequest
    }
  }

  //!=======================================================================
  // Khách hàng hủy yêu cầu dời lịch đang Pending
  async cancelRescheduleRequest(user_id: string, request_id: string) {
    const requestObjectId = new ObjectId(request_id)
    const userObjectId = new ObjectId(user_id)

    const request = await databaseService.rescheduleRequests.findOne({
      _id: requestObjectId,
      user_id: userObjectId
    })

    if (!request) throw new Error('Không tìm thấy yêu cầu dời lịch')
    if (request.status !== RescheduleStatus.Pending) {
      throw new Error('Chỉ có thể hủy yêu cầu dời lịch đang ở trạng thái chờ duyệt (Pending)')
    }

    await databaseService.rescheduleRequests.deleteOne({ _id: requestObjectId })

    return { message: 'Đã hủy yêu cầu dời lịch thành công' }
  }

  //!=======================================================================
  // Admin xem danh sách yêu cầu dời lịch
  async getRescheduleRequestsAdmin(status?: number) {
    const matchStage: any = {}
    if (status !== undefined && !isNaN(status)) {
      matchStage.status = Number(status)
    }

    const requests = await databaseService.rescheduleRequests
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: process.env.DB_BOOKINGS_COLLECTION as string,
            localField: 'booking_id',
            foreignField: '_id',
            as: 'booking_info'
          }
        },
        { $unwind: { path: '$booking_info', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: process.env.DB_USERS_COLLECTION as string,
            localField: 'user_id',
            foreignField: '_id',
            as: 'user_info'
          }
        },
        { $unwind: { path: '$user_info', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: process.env.DB_FIELDS_COLLECTION as string,
            localField: 'field_id',
            foreignField: '_id',
            as: 'field_info'
          }
        },
        { $unwind: { path: '$field_info', preserveNullAndEmptyArrays: true } },
        { $sort: { created_at: -1 } },
        {
          $project: {
            'user_info.password': 0,
            'user_info.email_verify_token': 0,
            'user_info.forgot_password_token': 0
          }
        }
      ])
      .toArray()

    return requests
  }

  //!=======================================================================
  // Admin duyệt yêu cầu dời lịch
  async approveRescheduleRequest(admin_id: string, request_id: string) {
    const requestObjectId = new ObjectId(request_id)
    const adminObjectId = new ObjectId(admin_id)

    const request = await databaseService.rescheduleRequests.findOne({ _id: requestObjectId })
    if (!request) throw new Error('Không tìm thấy yêu cầu dời lịch')
    if (request.status !== RescheduleStatus.Pending) {
      throw new Error('Yêu cầu này không ở trạng thái chờ duyệt (Pending)')
    }

    const booking = await databaseService.bookings.findOne({ _id: request.booking_id })
    if (!booking) throw new Error('Không tìm thấy vé đặt sân tương ứng')
    if (booking.status === BookingStatus.Cancelled) {
      throw new Error('Vé đặt sân này đã bị hủy từ trước')
    }

    // Re-check trùng lịch trước khi duyệt
    const isOverlap = await databaseService.bookings.findOne({
      _id: { $ne: booking._id },
      locked_field_ids: { $in: booking.locked_field_ids },
      status: { $in: [BookingStatus.Pending, BookingStatus.Confirmed] },
      $or: [
        { start_time: { $lt: request.new_end_time, $gte: request.new_start_time } },
        { end_time: { $gt: request.new_start_time, $lte: request.new_end_time } },
        { start_time: { $lte: request.new_start_time }, end_time: { $gte: request.new_end_time } }
      ]
    })

    if (isOverlap) {
      const error: any = new Error('Khung giờ mới đã bị chiếm. Không thể duyệt yêu cầu dời lịch này!')
      error.status = 400
      throw error
    }

    // 1. Cập nhật booking thời gian mới
    await databaseService.bookings.updateOne(
      { _id: booking._id },
      {
        $set: {
          start_time: request.new_start_time,
          end_time: request.new_end_time,
          updated_at: new Date()
        }
      }
    )

    // 2. Cập nhật trạng thái request -> Approved (1)
    await databaseService.rescheduleRequests.updateOne(
      { _id: request._id },
      {
        $set: {
          status: RescheduleStatus.Approved,
          reviewed_by: adminObjectId,
          updated_at: new Date()
        }
      }
    )

    return {
      message: 'Duyệt yêu cầu dời lịch thành công!',
      request_id,
      booking_id: booking._id
    }
  }

  //!=======================================================================
  // Admin từ chối yêu cầu dời lịch
  async rejectRescheduleRequest(admin_id: string, request_id: string, reason?: string) {
    const requestObjectId = new ObjectId(request_id)
    const adminObjectId = new ObjectId(admin_id)

    const request = await databaseService.rescheduleRequests.findOne({ _id: requestObjectId })
    if (!request) throw new Error('Không tìm thấy yêu cầu dời lịch')
    if (request.status !== RescheduleStatus.Pending) {
      throw new Error('Yêu cầu này không ở trạng thái chờ duyệt (Pending)')
    }

    await databaseService.rescheduleRequests.updateOne(
      { _id: request._id },
      {
        $set: {
          status: RescheduleStatus.Rejected,
          reject_reason: reason || 'Khung giờ đã kín / lý do khác',
          reviewed_by: adminObjectId,
          updated_at: new Date()
        }
      }
    )

    return {
      message: 'Từ chối yêu cầu dời lịch thành công!',
      request_id
    }
  }
}

const bookingServices = new BookingServices()
export default bookingServices
