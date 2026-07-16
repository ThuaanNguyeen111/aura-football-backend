"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkInBookingController = exports.rescheduleBookingController = exports.cancelBookingController = exports.getMyBookingHistoryController = exports.mockPaymentController = exports.createBookingController = exports.getBusyTimeSlotsController = void 0;
const bookings_services_1 = __importDefault(require("../services/bookings.services"));
const getBusyTimeSlotsController = async (req, res) => {
    // Lấy dữ liệu từ URL Query (?field_id=...&date=...)
    const { field_id, date } = req.query;
    const result = await bookings_services_1.default.getBusyTimeSlots(field_id, date);
    res.json({
        message: 'Lấy danh sách các khung giờ đã được đặt thành công',
        result
    });
};
exports.getBusyTimeSlotsController = getBusyTimeSlotsController;
const createBookingController = async (req, res) => {
    const { user_id } = req.decode_authorization; // Lấy từ AccessToken
    const result = await bookings_services_1.default.createBooking(user_id, req.body);
    res.json({ message: 'Đặt sân thành công', result });
};
exports.createBookingController = createBookingController;
const mockPaymentController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { booking_id } = req.body;
    const result = await bookings_services_1.default.mockPaymentSuccess(booking_id, user_id);
    res.json(result);
};
exports.mockPaymentController = mockPaymentController;
const getMyBookingHistoryController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const result = await bookings_services_1.default.getMyBookingHistory(user_id);
    res.json({ message: 'Lấy lịch sử đặt sân thành công', result });
};
exports.getMyBookingHistoryController = getMyBookingHistoryController;
const cancelBookingController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const { booking_id } = req.body;
    const result = await bookings_services_1.default.cancelBooking(user_id, booking_id);
    res.json(result);
};
exports.cancelBookingController = cancelBookingController;
// Thêm hàm Controller này vào cuối file
const rescheduleBookingController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    // Lúc này req.body được TypeScript hiểu 100% là RescheduleReqBody
    const result = await bookings_services_1.default.rescheduleBooking(user_id, req.body);
    res.json(result);
};
exports.rescheduleBookingController = rescheduleBookingController;
const checkInBookingController = async (req, res) => {
    const { booking_id } = req.body;
    const result = await bookings_services_1.default.checkInBooking(booking_id);
    res.json(result);
};
exports.checkInBookingController = checkInBookingController;
