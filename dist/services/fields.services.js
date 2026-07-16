"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_services_1 = __importDefault(require("../services/database.services"));
const fields_schemas_1 = __importDefault(require("../models/schema/fields.schemas"));
const enums_1 = require("../constants/enums");
class FieldServices {
    async seedFields() {
        // Kiểm tra xem database đã có dữ liệu sân chưa để tránh bị duplicate
        const count = await database_services_1.default.fields.countDocuments();
        if (count > 0) {
            return { message: 'Dữ liệu sân đã tồn tại, không cần khởi tạo lại!' };
        }
        // 1. Khởi tạo 4 Sân 5 người với ID tự động sinh trước
        const fieldA = new fields_schemas_1.default({
            name: 'Sân 5 - A',
            type: enums_1.FieldType.Pitch5,
            price_per_hour: 150000,
            amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
        });
        const fieldB = new fields_schemas_1.default({
            name: 'Sân 5 - B',
            type: enums_1.FieldType.Pitch5,
            price_per_hour: 150000,
            amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
        });
        const fieldC = new fields_schemas_1.default({
            name: 'Sân 5 - C',
            type: enums_1.FieldType.Pitch5,
            price_per_hour: 150000,
            amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
        });
        const fieldD = new fields_schemas_1.default({
            name: 'Sân 5 - D',
            type: enums_1.FieldType.Pitch5,
            price_per_hour: 150000,
            amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
        });
        await database_services_1.default.fields.insertMany([fieldA, fieldB, fieldC, fieldD]);
        // 2. Khởi tạo 2 Sân 7 người (Ghép từ A+B và C+D)
        // Thuộc tính linked_field_ids chính là chìa khóa để chặn trùng lịch sau này
        const field7_1 = new fields_schemas_1.default({
            name: 'Sân 7 - VIP 1',
            type: enums_1.FieldType.Pitch7,
            price_per_hour: 350000, // Giá Sân 7 thường cao hơn tổng 2 Sân 5
            amenities: ['Trọng tài', 'Nước suối', 'Bóng thi đấu VIP', 'Khán đài'],
            linked_field_ids: [fieldA._id, fieldB._id]
        });
        const field7_2 = new fields_schemas_1.default({
            name: 'Sân 7 - VIP 2',
            type: enums_1.FieldType.Pitch7,
            price_per_hour: 350000,
            amenities: ['Trọng tài', 'Nước suối', 'Bóng thi đấu VIP', 'Khán đài'],
            linked_field_ids: [fieldC._id, fieldD._id]
        });
        await database_services_1.default.fields.insertMany([field7_1, field7_2]);
        return { message: 'Đã khởi tạo thành công hệ thống 6 sân bóng!' };
    }
    async getAllFields() {
        // Trả về danh sách tất cả các sân đang hoạt động cho App Flutter
        return await database_services_1.default.fields.find({ is_active: true }).toArray();
    }
}
const fieldServices = new FieldServices();
exports.default = fieldServices;
