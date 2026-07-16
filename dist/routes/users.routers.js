"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controllers_1 = require("../controllers/users.controllers");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const handlers_1 = require("../utils/handlers");
const usersRouter = (0, express_1.Router)();
// 1. [POST] /users/register - Đăng ký tài khoản mới bằng email
usersRouter.post('/register', users_middlewares_1.registerValidator, (0, handlers_1.WarpAsync)(users_controllers_1.registerController));
// 2. [POST] /users/verify-otp - Xác thực mã số OTP kích hoạt tài khoản
usersRouter.post('/verify-otp', (0, handlers_1.WarpAsync)(users_controllers_1.verifyOtpRegisterController));
// 3. [POST] /users/login - Đăng nhập tài khoản bằng email + mật khẩu
usersRouter.post('/login', users_middlewares_1.loginValidator, (0, handlers_1.WarpAsync)(users_controllers_1.loginController));
// 4. [POST] /users/google-oauth - Đăng nhập bằng tài khoản Google dành cho Flutter
usersRouter.post('/google-oauth', users_middlewares_1.googleOAuthValidator, (0, handlers_1.WarpAsync)(users_controllers_1.googleOAuthController));
// 5. [POST] /users/logout - Đăng xuất tài khoản, thu hồi Refresh Token
usersRouter.post('/logout', users_middlewares_1.accessTokenValidator, users_middlewares_1.refreshTokenValidator, (0, handlers_1.WarpAsync)(users_controllers_1.logoutController));
// 6. [POST] /users/forgot-password - Yêu cầu quên mật khẩu (Gửi OTP khôi phục)
usersRouter.post('/forgot-password', users_middlewares_1.forgotPasswordValidator, (0, handlers_1.WarpAsync)(users_controllers_1.forgotPasswordController));
// 7. [POST] /users/reset-password - Cung cấp OTP và thiết lập mật khẩu mới
usersRouter.post('/reset-password', users_middlewares_1.resetPasswordValidator, (0, handlers_1.WarpAsync)(users_controllers_1.resetPasswordController));
// 8. [GET] /users/me - Lấy thông tin tài khoản cá nhân của người dùng di động
usersRouter.get('/me', users_middlewares_1.accessTokenValidator, (0, handlers_1.WarpAsync)(users_controllers_1.getMeController));
// 9. [POST] /users/refresh-token - Cơ chế tự động làm mới mã Access Token âm thầm
usersRouter.post('/refresh-token', users_middlewares_1.refreshTokenValidator, (0, handlers_1.WarpAsync)(users_controllers_1.refreshAccessTokenController));
exports.default = usersRouter;
