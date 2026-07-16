"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupPendingBookingsJob = void 0;
const database_services_1 = __importDefault(require("../services/database.services"));
const enums_1 = require("../constants/enums");
const startCleanupPendingBookingsJob = async () => {
    try {
        const cron = await import('node-cron');
        // Tiến hành lập lịch quét hệ thống mỗi 1 phút một lần
        cron.default.schedule('* * * * *', async () => {
            try {
                const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
                // Tìm và cập nhật các vé trạng thái Pending quá 5 phút thành Cancelled
                const result = await database_services_1.default.bookings.updateMany({
                    status: enums_1.BookingStatus.Pending,
                    created_at: { $lte: fiveMinutesAgo }
                }, {
                    $set: {
                        status: enums_1.BookingStatus.Cancelled,
                        updated_at: new Date()
                    }
                });
                if (result.modifiedCount > 0) {
                    console.log(`扫 🧹 [Cronjob] Đã tự động hủy ${result.modifiedCount} vé quá hạn thanh toán. Giải phóng sân thành công!`);
                }
            }
            catch (cronError) {
                console.error('❌ Lỗi xảy ra trong tiến trình quét và cập nhật trạng thái vé:', cronError);
            }
        });
    }
    catch (initError) {
        console.error('❌ Không thể khởi tạo tiến trình Cronjob do lỗi nạp thư viện:', initError);
    }
};
exports.startCleanupPendingBookingsJob = startCleanupPendingBookingsJob;
