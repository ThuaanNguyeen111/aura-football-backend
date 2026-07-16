"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewValidator = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../utils/validation");
const mongodb_1 = require("mongodb");
exports.createReviewValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    booking_id: {
        notEmpty: { errorMessage: 'ID vé không được để trống' },
        custom: {
            options: (value) => {
                if (!mongodb_1.ObjectId.isValid(value))
                    throw new Error('ID vé không hợp lệ');
                return true;
            }
        }
    },
    rating: {
        notEmpty: { errorMessage: 'Vui lòng chọn số sao đánh giá' },
        isInt: {
            options: { min: 1, max: 5 },
            errorMessage: 'Điểm đánh giá phải từ 1 đến 5 sao'
        }
    },
    comment: {
        optional: true,
        isString: { errorMessage: 'Bình luận phải là chuỗi văn bản' },
        trim: true
    }
}, ['body']));
