"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookings_controllers_1 = require("../controllers/bookings.controllers");
const bookings_middlewares_1 = require("../middlewares/bookings.middlewares");
const handlers_1 = require("../utils/handlers");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const bookings_middlewares_2 = require("../middlewares/bookings.middlewares");
const bookings_controllers_2 = require("../controllers/bookings.controllers");
const bookings_middlewares_3 = require("../middlewares/bookings.middlewares");
const bookings_controllers_3 = require("../controllers/bookings.controllers");
const bookings_controllers_4 = require("../controllers/bookings.controllers");
const users_middlewares_2 = require("../middlewares/users.middlewares");
const bookings_middlewares_4 = require("../middlewares/bookings.middlewares");
const bookings_controllers_5 = require("../controllers/bookings.controllers");
const bookingsRouter = (0, express_1.Router)();
// [GET] /bookings/busy-slots?field_id=...&date=2026-06-28
bookingsRouter.get('/busy-slots', bookings_middlewares_1.getBusySlotsValidator, (0, handlers_1.WarpAsync)(bookings_controllers_1.getBusyTimeSlotsController));
// [POST] /bookings - Đặt sân mới
bookingsRouter.post('/', users_middlewares_1.accessTokenValidator, bookings_middlewares_2.createBookingValidator, (0, handlers_1.WarpAsync)(bookings_controllers_2.createBookingController));
// [POST] /bookings/mock-payment - Giả lập thanh toán thành công
bookingsRouter.post('/mock-payment', users_middlewares_1.accessTokenValidator, (0, handlers_1.WarpAsync)(bookings_controllers_2.mockPaymentController));
// [GET] /bookings/history - Lấy lịch sử vé (Render ra màn hình Lịch sử)
bookingsRouter.get('/history', users_middlewares_1.accessTokenValidator, (0, handlers_1.WarpAsync)(bookings_controllers_2.getMyBookingHistoryController));
// [POST] /bookings/cancel - Hủy đặt sân & hoàn tiền ví nội bộ
bookingsRouter.post('/cancel', users_middlewares_1.accessTokenValidator, bookings_middlewares_3.cancelBookingValidator, (0, handlers_1.WarpAsync)(bookings_controllers_3.cancelBookingController));
// [POST] /bookings/reschedule - Dời lịch đặt sân sang khung giờ khác
bookingsRouter.post('/reschedule', users_middlewares_1.accessTokenValidator, bookings_middlewares_4.rescheduleBookingValidator, (0, handlers_1.WarpAsync)(bookings_controllers_5.rescheduleBookingController));
// [POST] /bookings/check-in - Admin quét mã QR cho khách vào sân
bookingsRouter.post('/check-in', users_middlewares_1.accessTokenValidator, users_middlewares_2.adminValidator, // 🔥 Đổi thành adminValidator
(0, handlers_1.WarpAsync)(bookings_controllers_4.checkInBookingController));
exports.default = bookingsRouter;
