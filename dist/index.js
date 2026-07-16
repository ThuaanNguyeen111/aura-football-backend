"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cronjobs_1 = require("./utils/cronjobs");
const database_services_1 = __importDefault(require("./services/database.services"));
const users_routers_1 = __importDefault(require("./routes/users.routers"));
const error_middlewares_1 = require("./middlewares/error.middlewares");
const fields_routers_1 = __importDefault(require("./routes/fields.routers"));
const bookings_routers_1 = __importDefault(require("./routes/bookings.routers"));
const reviews_routers_1 = __importDefault(require("./routes/reviews.routers"));
const admin_routers_1 = __importDefault(require("./routes/admin.routers"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Middleware parse JSON
app.use(express_1.default.json());
// Cấu hình CORS cho phép Flutter App gọi API thoải mái
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
// Kết nối Native MongoDB
database_services_1.default.connect();
// Định tuyến API
app.use('/admin', admin_routers_1.default);
app.use('/users', users_routers_1.default);
app.use('/fields', fields_routers_1.default);
app.use('/bookings', bookings_routers_1.default);
// Middleware bẫy lỗi tổng (Bắt buộc phải nằm dưới cùng)
app.use('/reviews', reviews_routers_1.default);
app.use(error_middlewares_1.defaultErrorHandler);
(0, cronjobs_1.startCleanupPendingBookingsJob)(); // Kích hoạt hệ thống dọn rác ngầm
app.listen(PORT, () => {
    console.log(`🚀 Aura Football Booking API đang chạy trơn tru trên port ${PORT}`);
});
