"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFieldsController = exports.seedFieldsController = void 0;
const fields_services_1 = __importDefault(require("../services/fields.services"));
const seedFieldsController = async (req, res) => {
    const result = await fields_services_1.default.seedFields();
    res.json({ result });
};
exports.seedFieldsController = seedFieldsController;
const getAllFieldsController = async (req, res) => {
    const result = await fields_services_1.default.getAllFields();
    res.json({
        message: 'Lấy danh sách sân bóng thành công',
        result
    });
};
exports.getAllFieldsController = getAllFieldsController;
