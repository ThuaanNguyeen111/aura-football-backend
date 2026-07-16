"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFieldController = exports.getRevenueController = exports.forceCancelBookingController = exports.getDailyBookingsController = void 0;
const admin_services_1 = __importDefault(require("../services/admin.services"));
const getDailyBookingsController = async (req, res) => {
    const result = await admin_services_1.default.getDailyBookings(req.query.date);
    res.json({ message: 'Lấy lịch đặt sân thành công', result });
};
exports.getDailyBookingsController = getDailyBookingsController;
const forceCancelBookingController = async (req, res) => {
    const { booking_id, reason } = req.body;
    const result = await admin_services_1.default.forceCancelBooking(booking_id, reason);
    res.json(result);
};
exports.forceCancelBookingController = forceCancelBookingController;
const getRevenueController = async (req, res) => {
    const { start_date, end_date } = req.query;
    const result = await admin_services_1.default.getRevenue(start_date, end_date);
    res.json({ message: 'Thống kê doanh thu thành công', result });
};
exports.getRevenueController = getRevenueController;
const updateFieldController = async (req, res) => {
    const { field_id } = req.params;
    const result = await admin_services_1.default.updateField(field_id, req.body);
    res.json({ message: 'Cập nhật sân thành công', result });
};
exports.updateFieldController = updateFieldController;
