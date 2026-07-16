"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const enums_1 = require("../constants/enums");
// Thêm vào class BookingServices trong src/services/bookings.services.ts
const bookings_schemas_1 = __importDefault(require("../models/schema/bookings.schemas"));
const enums_2 = require("../constants/enums");
class BookingServices {
    //!=====================================================================================================
    async getBusyTimeSlots(field_id, date) {
        // 1. Chuẩn hóa chuỗi ngày (VD: '2026-06-28') thành mốc 0h00 và 23h59
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        // 2. Truy vấn cốt lõi: Tìm tất cả các vé đang Hold (Pending) hoặc Đã thanh toán (Confirmed)
        const busyBookings = await database_services_1.default.bookings
            .find({
            locked_field_ids: new mongodb_1.ObjectId(field_id),
            status: { $in: [enums_1.BookingStatus.Pending, enums_1.BookingStatus.Confirmed] },
            $or: [
                // Bắt các vé có thời gian bắt đầu hoặc kết thúc cắt ngang qua ngày hôm nay
                { start_time: { $gte: startOfDay, $lte: endOfDay } },
                { end_time: { $gte: startOfDay, $lte: endOfDay } }
            ]
        })
            .project({ start_time: 1, end_time: 1, status: 1, _id: 0 }) // Chỉ lấy đúng 3 trường cần thiết, giấu ID vé đi
            .sort({ start_time: 1 }) // Sắp xếp giờ từ sáng đến tối
            .toArray();
        return busyBookings;
    }
    //!=====================================================================================================
    async createBooking(user_id, payload) {
        const { field_id, start_time, end_time, payment_method } = payload;
        const startTime = new Date(start_time);
        const endTime = new Date(end_time);
        // 1. Kiểm tra Sân bóng có tồn tại
        const field = await database_services_1.default.fields.findOne({ _id: new mongodb_1.ObjectId(field_id) });
        if (!field)
            throw new Error('Sân bóng không tồn tại');
        // 2. Chống Race Condition (Trùng lịch)
        const lockedIds = [field._id, ...(field.linked_field_ids || [])];
        const isOverlap = await database_services_1.default.bookings.findOne({
            locked_field_ids: { $in: lockedIds },
            status: { $in: [enums_1.BookingStatus.Pending, enums_1.BookingStatus.Confirmed] },
            $or: [
                { start_time: { $lt: endTime, $gte: startTime } },
                { end_time: { $gt: startTime, $lte: endTime } },
                { start_time: { $lte: startTime }, end_time: { $gte: endTime } }
            ]
        });
        if (isOverlap) {
            throw new Error('Rất tiếc, khung giờ này vừa có người khác đặt thành công. Vui lòng chọn khung giờ khác!');
        }
        // 3. Tính toán chi phí sắc bén theo Schema mới
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const base_price = durationHours * field.price_per_hour;
        let discount_amount = 0;
        // Kiểm tra xem khách đã từng có đơn Confirmed nào chưa
        const hasBooked = await database_services_1.default.bookings.findOne({
            user_id: new mongodb_1.ObjectId(user_id),
            status: enums_1.BookingStatus.Confirmed
        });
        if (!hasBooked) {
            discount_amount = base_price * 0.2; // Khách mới: Giảm 20%
        }
        const final_price = base_price - discount_amount;
        // 4. Quyết định trạng thái
        const status = payment_method === enums_2.PaymentMethod.Cash ? enums_1.BookingStatus.Confirmed : enums_1.BookingStatus.Pending;
        // 5. Lưu vào Database
        const newBooking = new bookings_schemas_1.default({
            user_id: new mongodb_1.ObjectId(user_id),
            field_id: field._id,
            locked_field_ids: lockedIds,
            start_time: startTime,
            end_time: endTime,
            base_price,
            discount_amount,
            final_price,
            payment_method,
            status
        });
        await database_services_1.default.bookings.insertOne(newBooking);
        return newBooking;
    }
    //!=====================================================================================================
    // Khởi tạo luồng Mock Payment cho phương thức Chuyển khoản
    async mockPaymentSuccess(booking_id, user_id) {
        const booking = await database_services_1.default.bookings.findOne({
            _id: new mongodb_1.ObjectId(booking_id),
            user_id: new mongodb_1.ObjectId(user_id)
        });
        if (!booking)
            throw new Error('Vé đặt sân không tồn tại');
        if (booking.status !== enums_1.BookingStatus.Pending)
            throw new Error('Vé này không ở trạng thái chờ thanh toán');
        await database_services_1.default.bookings.updateOne({ _id: new mongodb_1.ObjectId(booking_id) }, { $set: { status: enums_1.BookingStatus.Confirmed, updated_at: new Date() } });
        return { message: 'Thanh toán mô phỏng thành công, vé đã được xác nhận!' };
    }
    //!=====================================================================================================
    // Lấy lịch sử đặt sân của user (Aggregate để nối data Sân bóng)
    async getMyBookingHistory(user_id) {
        const history = await database_services_1.default.bookings
            .aggregate([
            { $match: { user_id: new mongodb_1.ObjectId(user_id) } },
            {
                $lookup: {
                    from: process.env.DB_FIELDS_COLLECTION,
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
            .toArray();
        return history;
    }
    //!=====================================================================================================
    async cancelBooking(user_id, booking_id) {
        const bookingObjectId = new mongodb_1.ObjectId(booking_id);
        const userObjectId = new mongodb_1.ObjectId(user_id);
        // 1. Tìm vé đặt sân và kiểm tra quyền sở hữu
        const booking = await database_services_1.default.bookings.findOne({
            _id: bookingObjectId,
            user_id: userObjectId
        });
        if (!booking)
            throw new Error('Không tìm thấy vé đặt sân hoặc bạn không có quyền hủy vé này');
        if (booking.status === enums_1.BookingStatus.Cancelled)
            throw new Error('Vé này đã được hủy từ trước');
        // 2. Xử lý logic hoàn tiền dựa vào trạng thái vé hiện tại
        let refundAmount = 0;
        let message = 'Hủy giữ chỗ thành công!';
        if (booking.status === enums_1.BookingStatus.Confirmed) {
            // Phạt 10%, hoàn lại 90% trên số tiền final_price khách thực trả
            refundAmount = booking.final_price * 0.9;
            message = `Hủy sân thành công! Bạn đã bị trừ 10% phí phạt. Số tiền 90% (${refundAmount.toLocaleString('vi-VN')} Đ) đã được hoàn vào ví nội bộ.`;
            // Thực hiện cộng tiền vào ví của User trong database
            await database_services_1.default.users.updateOne({ _id: userObjectId }, {
                $inc: { wallet_balance: refundAmount },
                $set: { updated_at: new Date() }
            });
        }
        // 3. Cập nhật trạng thái vé thành Cancelled để giải phóng sân ngay lập tức
        await database_services_1.default.bookings.updateOne({ _id: bookingObjectId }, {
            $set: {
                status: enums_1.BookingStatus.Cancelled,
                updated_at: new Date()
            }
        });
        return {
            message,
            refund_amount: refundAmount,
            booking_id
        };
    }
    //!================================================================================================================
    // Thêm hàm này vào class BookingServices
    async rescheduleBooking(user_id, payload) {
        const bookingObjectId = new mongodb_1.ObjectId(payload.booking_id);
        const userObjectId = new mongodb_1.ObjectId(user_id);
        const newStartTime = new Date(payload.start_time);
        const newEndTime = new Date(payload.end_time);
        // 1. Tìm vé đặt sân để đảm bảo vé này của đúng user đó
        const booking = await database_services_1.default.bookings.findOne({
            _id: bookingObjectId,
            user_id: userObjectId
        });
        if (!booking)
            throw new Error('Không tìm thấy vé đặt sân hoặc bạn không có quyền thao tác');
        if (booking.status === enums_1.BookingStatus.Cancelled)
            throw new Error('Không thể dời lịch cho vé đã bị hủy');
        // 2. CHỐNG TRÙNG LỊCH NÂNG CAO: Kiểm tra giờ mới có trống không
        const isOverlap = await database_services_1.default.bookings.findOne({
            _id: { $ne: bookingObjectId }, // 🔥 CỰC KỲ QUAN TRỌNG: Bỏ qua chính vé đang muốn dời
            locked_field_ids: { $in: booking.locked_field_ids },
            status: { $in: [enums_1.BookingStatus.Pending, enums_1.BookingStatus.Confirmed] },
            $or: [
                { start_time: { $lt: newEndTime, $gte: newStartTime } },
                { end_time: { $gt: newStartTime, $lte: newEndTime } },
                { start_time: { $lte: newStartTime }, end_time: { $gte: newEndTime } }
            ]
        });
        if (isOverlap) {
            throw new Error('Khung giờ mới đã có người đặt hoặc bị trùng lặp. Vui lòng chọn khoảng thời gian khác!');
        }
        // 3. Thực hiện dời lịch (Cập nhật thời gian mới, giữ nguyên giá tiền theo rule)
        await database_services_1.default.bookings.updateOne({ _id: bookingObjectId }, {
            $set: {
                start_time: newStartTime,
                end_time: newEndTime,
                updated_at: new Date()
            }
        });
        return {
            message: 'Dời lịch sân thành công!',
            booking_id: payload.booking_id,
            new_start_time: newStartTime,
            new_end_time: newEndTime
        };
    }
    //!=======================================================================
    async checkInBooking(booking_id) {
        const bookingObjectId = new mongodb_1.ObjectId(booking_id);
        const booking = await database_services_1.default.bookings.findOne({ _id: bookingObjectId });
        if (!booking)
            throw new Error('Không tìm thấy vé trên hệ thống');
        if (booking.status !== enums_1.BookingStatus.Confirmed) {
            throw new Error('Chỉ có thể Check-in cho vé đang ở trạng thái Đã thanh toán (Confirmed)');
        }
        await database_services_1.default.bookings.updateOne({ _id: bookingObjectId }, {
            $set: {
                status: enums_1.BookingStatus.Completed,
                updated_at: new Date()
            }
        });
        return { message: 'Check-in thành công! Khách hàng có thể vào sân.' };
    }
}
const bookingServices = new BookingServices();
exports.default = bookingServices;
