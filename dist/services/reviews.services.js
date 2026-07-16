"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const reviews_schemas_1 = __importDefault(require("../models/schema/reviews.schemas"));
const enums_1 = require("../constants/enums");
class ReviewServices {
    async createReview(user_id, payload) {
        const bookingObjectId = new mongodb_1.ObjectId(payload.booking_id);
        const userObjectId = new mongodb_1.ObjectId(user_id);
        // 1. Kiểm tra vé có hợp lệ và đúng chính chủ không
        const booking = await database_services_1.default.bookings.findOne({
            _id: bookingObjectId,
            user_id: userObjectId
        });
        if (!booking)
            throw new Error('Không tìm thấy vé hoặc bạn không có quyền đánh giá');
        // 2. Logic siêu chặt chẽ: Phải là vé Confirmed/Completed và thời gian đá đã qua
        const now = new Date();
        if (booking.status !== enums_1.BookingStatus.Confirmed && booking.status !== enums_1.BookingStatus.Completed) {
            throw new Error('Chỉ được phép đánh giá sân khi vé đã thanh toán thành công hoặc đã sử dụng');
        }
        if (booking.end_time > now && booking.status !== enums_1.BookingStatus.Completed) {
            throw new Error('Trận đấu chưa kết thúc. Vui lòng quay lại đánh giá sau khi đá xong nhé!');
        }
        // 3. Chống Spam: Mỗi vé chỉ được đánh giá 1 lần
        const existingReview = await database_services_1.default.reviews.findOne({ booking_id: bookingObjectId });
        if (existingReview) {
            throw new Error('Bạn đã đánh giá cho suất đá này rồi');
        }
        // 4. Lưu đánh giá vào hệ thống
        const newReview = new reviews_schemas_1.default({
            user_id: userObjectId,
            field_id: booking.field_id,
            booking_id: bookingObjectId,
            rating: payload.rating,
            comment: payload.comment || ''
        });
        await database_services_1.default.reviews.insertOne(newReview);
        return {
            message: 'Cảm ơn bạn đã đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn.',
            review: newReview
        };
    }
}
const reviewServices = new ReviewServices();
exports.default = reviewServices;
