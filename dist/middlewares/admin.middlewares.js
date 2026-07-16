"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceCancelValidator = exports.revenueValidator = exports.getDailyBookingsValidator = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../utils/validation");
const mongodb_1 = require("mongodb");
exports.getDailyBookingsValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày cần tra cứu' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601 (VD: 2026-06-28)' }
    }
}, ['query']));
exports.revenueValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    start_date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày bắt đầu' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601' }
    },
    end_date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày kết thúc' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601' }
    }
}, ['query']));
exports.forceCancelValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    booking_id: {
        in: ['body'],
        notEmpty: { errorMessage: 'ID vé không được để trống' },
        custom: {
            options: (value) => {
                if (!mongodb_1.ObjectId.isValid(value))
                    throw new Error('ID vé không hợp lệ');
                return true;
            }
        }
    },
    reason: {
        in: ['body'],
        notEmpty: { errorMessage: 'Vui lòng nhập lý do hủy vé' },
        isString: { errorMessage: 'Lý do phải là văn bản' }
    }
}, ['body']));
