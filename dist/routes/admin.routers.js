"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handlers_1 = require("../utils/handlers");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const admin_middlewares_1 = require("../middlewares/admin.middlewares");
const admin_controllers_1 = require("../controllers/admin.controllers");
const adminRouter = (0, express_1.Router)();
// Nhóm API Xem lịch đặt sân hàng ngày
adminRouter.get('/bookings/daily', users_middlewares_1.accessTokenValidator, users_middlewares_1.adminValidator, // 🔥 Đổi thành adminValidator
admin_middlewares_1.getDailyBookingsValidator, (0, handlers_1.WarpAsync)(admin_controllers_1.getDailyBookingsController));
// [POST] /admin/bookings/force-cancel - Admin hủy vé khẩn cấp & hoàn tiền 100% vào ví
adminRouter.post('/bookings/force-cancel', users_middlewares_1.accessTokenValidator, users_middlewares_1.adminValidator, admin_middlewares_1.forceCancelValidator, (0, handlers_1.WarpAsync)(admin_controllers_1.forceCancelBookingController));
// [GET] /admin/revenue - Admin thống kê báo cáo doanh thu theo mốc thời gian
adminRouter.get('/revenue', users_middlewares_1.accessTokenValidator, users_middlewares_1.adminValidator, admin_middlewares_1.revenueValidator, (0, handlers_1.WarpAsync)(admin_controllers_1.getRevenueController));
// [PUT] /admin/fields/:field_id - Admin chỉnh sửa giá tiền hoặc trạng thái đóng/mở sân
adminRouter.put('/fields/:field_id', users_middlewares_1.accessTokenValidator, users_middlewares_1.adminValidator, (0, handlers_1.WarpAsync)(admin_controllers_1.updateFieldController));
exports.default = adminRouter;
