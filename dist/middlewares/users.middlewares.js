"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminValidator = exports.googleOAuthValidator = exports.resetPasswordValidator = exports.forgotPasswordValidator = exports.refreshTokenValidator = exports.accessTokenValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
const validation_1 = require("../utils/validation");
const database_services_1 = __importDefault(require("../services/database.services"));
const users_services_1 = __importDefault(require("../services/users.services"));
const crypto_1 = require("../utils/crypto");
const message_1 = require("../constants/message");
const Errors_1 = require("../models/Errors");
const httpStatus_1 = __importDefault(require("../constants/httpStatus"));
const jwt_1 = require("../utils/jwt");
const enums_1 = require("../constants/enums");
exports.registerValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    name: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.NAME_IS_REQUIRED },
        isString: { errorMessage: message_1.USERS_MESSAGES.NAME_MUST_BE_A_STRING },
        trim: true
    },
    email: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
            options: async (value) => {
                const isExist = await users_services_1.default.checkEmailExist(value);
                if (isExist)
                    throw new Error(message_1.USERS_MESSAGES.EMAIL_ALREADY_EXISTS);
                return true;
            }
        }
    },
    password: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: message_1.USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        isLength: { options: { min: 6 }, errorMessage: 'Mật khẩu phải dài ít nhất 6 ký tự' }
    }
}, ['body']));
exports.loginValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const hashedPassword = (0, crypto_1.hashPassword)(req.body.password);
                const user = await database_services_1.default.users.findOne({ email: value, password: hashedPassword });
                if (!user)
                    throw new Error(message_1.USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT);
                req.user = user; // Nhét user vào req để Controller dùng
                return true;
            }
        }
    }
}, ['body']));
exports.accessTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    Authorization: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                const accessToken = value.split(' ')[1];
                if (!accessToken) {
                    throw new Errors_1.ErrorWithStatus({
                        message: message_1.USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const decoded = await (0, jwt_1.verifyToken)({
                        token: accessToken,
                        secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN
                    });
                    req.decode_authorization = decoded;
                }
                catch (error) {
                    throw new Errors_1.ErrorWithStatus({
                        message: 'Token hết hạn hoặc không hợp lệ',
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                return true;
            }
        }
    }
}, ['headers']));
exports.refreshTokenValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    refresh_token: {
        trim: true,
        custom: {
            options: async (value, { req }) => {
                if (!value) {
                    throw new Errors_1.ErrorWithStatus({
                        message: message_1.USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                        status: httpStatus_1.default.UNAUTHORIZED
                    });
                }
                try {
                    const [decoded, refreshTokenDb] = await Promise.all([
                        (0, jwt_1.verifyToken)({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN }),
                        database_services_1.default.refreshTokens.findOne({ token: value })
                    ]);
                    if (!refreshTokenDb) {
                        throw new Errors_1.ErrorWithStatus({
                            message: message_1.USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                            status: httpStatus_1.default.UNAUTHORIZED
                        });
                    }
                    ;
                    req.decode_refresh_token = decoded;
                }
                catch (error) {
                    throw new Errors_1.ErrorWithStatus({ message: 'Refresh token lỗi hoặc hết hạn', status: httpStatus_1.default.UNAUTHORIZED });
                }
                return true;
            }
        }
    }
}, ['body']));
exports.forgotPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true
    }
}, ['body']));
exports.resetPasswordValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    email: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: message_1.USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true
    },
    otpCode: {
        notEmpty: { errorMessage: 'Mã OTP không được để trống' },
        isLength: { options: { min: 6, max: 6 }, errorMessage: 'Mã OTP phải có đúng 6 chữ số' },
        trim: true
    },
    password: {
        notEmpty: { errorMessage: message_1.USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: message_1.USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        isLength: { options: { min: 6 }, errorMessage: 'Mật khẩu mới phải dài ít nhất 6 ký tự' }
    }
}, ['body']));
exports.googleOAuthValidator = (0, validation_1.validate)((0, express_validator_1.checkSchema)({
    idToken: {
        notEmpty: { errorMessage: 'Mã idToken từ Google gửi lên không được để trống' },
        trim: true
    }
}, ['body']));
const adminValidator = (req, res, next) => {
    const { user_role } = req.decode_authorization;
    if (user_role !== enums_1.UserRole.Admin) {
        return res.status(403).json({
            message: 'Quyền truy cập bị từ chối. Chức năng này chỉ dành cho Ban quản lý (Admin)!'
        });
    }
    next();
};
exports.adminValidator = adminValidator;
