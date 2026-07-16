"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const enums_1 = require("../constants/enums");
class AdminServices {
    // 1. Lấy danh sách toàn bộ vé trong ngày (Cho Staff trực quầy)
    async getDailyBookings(date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
        const bookings = await database_services_1.default.bookings
            .aggregate([
            {
                $match: {
                    start_time: { $gte: startOfDay, $lte: endOfDay },
                    status: { $in: [enums_1.BookingStatus.Pending, enums_1.BookingStatus.Confirmed, enums_1.BookingStatus.Completed] }
                }
            },
            {
                $lookup: {
                    from: process.env.DB_USERS_COLLECTION,
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },
            {
                $lookup: {
                    from: process.env.DB_FIELDS_COLLECTION,
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
            .toArray();
        return bookings;
    }
    // 2. Hủy vé khẩn cấp & Hoàn 100% tiền (Cho Admin)
    async forceCancelBooking(booking_id, reason) {
        const bookingObjectId = new mongodb_1.ObjectId(booking_id);
        const booking = await database_services_1.default.bookings.findOne({ _id: bookingObjectId });
        if (!booking)
            throw new Error('Không tìm thấy vé đặt sân');
        if (booking.status === enums_1.BookingStatus.Cancelled)
            throw new Error('Vé này đã bị hủy từ trước');
        // Hoàn 100% tiền nếu vé đã thanh toán
        if (booking.status === enums_1.BookingStatus.Confirmed || booking.status === enums_1.BookingStatus.Completed) {
            await database_services_1.default.users.updateOne({ _id: booking.user_id }, { $inc: { wallet_balance: booking.final_price } });
        }
        await database_services_1.default.bookings.updateOne({ _id: bookingObjectId }, {
            $set: {
                status: enums_1.BookingStatus.Cancelled,
                updated_at: new Date()
            }
        });
        return { message: `Đã hủy vé khẩn cấp thành công. Lý do: ${reason}. Hệ thống đã hoàn 100% tiền cho khách.` };
    }
    // 3. Thống kê doanh thu theo giai đoạn (Cho Admin)
    async getRevenue(startDate, endDate) {
        const start = new Date(`${startDate}T00:00:00.000Z`);
        const end = new Date(`${endDate}T23:59:59.999Z`);
        const revenueData = await database_services_1.default.bookings
            .aggregate([
            {
                $match: {
                    created_at: { $gte: start, $lte: end },
                    status: { $in: [enums_1.BookingStatus.Confirmed, enums_1.BookingStatus.Completed] }
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
            .toArray();
        // Định dạng lại kết quả trả về cho Front-end dễ đọc
        let cashRevenue = 0;
        let transferRevenue = 0;
        let totalBookings = 0;
        revenueData.forEach((item) => {
            totalBookings += item.total_bookings;
            if (item._id === 0)
                cashRevenue += item.total_revenue; // Cash
            if (item._id === 1)
                transferRevenue += item.total_revenue; // Transfer
        });
        return {
            total_revenue: cashRevenue + transferRevenue,
            cash_revenue: cashRevenue,
            transfer_revenue: transferRevenue,
            total_bookings: totalBookings
        };
    }
    // 4. Chỉnh sửa thông tin sân (Khóa sân, cập nhật giá)
    async updateField(field_id, payload) {
        const result = await database_services_1.default.fields.findOneAndUpdate({ _id: new mongodb_1.ObjectId(field_id) }, {
            $set: {
                ...payload,
                updated_at: new Date()
            }
        }, { returnDocument: 'after' });
        if (!result)
            throw new Error('Không tìm thấy sân bóng');
        return result;
    }
}
const adminServices = new AdminServices();
exports.default = adminServices;
