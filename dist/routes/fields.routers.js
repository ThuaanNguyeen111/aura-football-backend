"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fields_controllers_1 = require("../controllers/fields.controllers");
const handlers_1 = require("../utils/handlers");
const fieldsRouter = (0, express_1.Router)();
// [POST] /fields/seed - Khởi tạo dữ liệu gốc (Chỉ gọi 1 lần để setup DB)
fieldsRouter.post('/seed', (0, handlers_1.WarpAsync)(fields_controllers_1.seedFieldsController));
// [GET] /fields - Lấy danh sách toàn bộ sân bóng (Dành cho màn hình Home Flutter)
fieldsRouter.get('/', (0, handlers_1.WarpAsync)(fields_controllers_1.getAllFieldsController));
exports.default = fieldsRouter;
