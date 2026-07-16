"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const database_services_1 = __importDefault(require("./database.services"));
const crypto_1 = require("../utils/crypto");
const jwt_1 = require("../utils/jwt");
const mailer_1 = require("../utils/mailer");
const enums_1 = require("../constants/enums");
const users_schemas_1 = __importDefault(require("../models/schema/users.schemas"));
class UserServices {
    async signAccessToken(user_id, role, verify) {
        return (0, jwt_1.signToken)({
            payload: { user_id, role, verify, token_type: 0 },
            options: { expiresIn: '30m' }, // Token sống 30 phút cho Flutter
            privateKey: process.env.JWT_SECRET_ACCESS_TOKEN
        });
    }
    async signRefreshToken(user_id, role, verify) {
        return (0, jwt_1.signToken)({
            payload: { user_id, role, verify, token_type: 1 },
            options: { expiresIn: '7d' }, // Sống 7 ngày
            privateKey: process.env.JWT_SECRET_REFRESH_TOKEN
        });
    }
    async checkEmailExist(email) {
        const result = await database_services_1.default.users.findOne({ email });
        return Boolean(result);
    }
    async register(payload) {
        const user_id = new mongodb_1.ObjectId();
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await database_services_1.default.users.insertOne(new users_schemas_1.default({
            _id: user_id,
            name: payload.name,
            email: payload.email,
            password: (0, crypto_1.hashPassword)(payload.password),
            phone_number: payload.phone_number,
            email_verify_token: otpCode, // Lưu OTP 6 số
            verify: enums_1.UserVerifyStatus.Unverified,
            role: enums_1.UserRole.User
        }));
        await (0, mailer_1.sendOtpVerificationEmail)(payload.email, payload.name, otpCode);
        return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP!' };
    }
    async verifyOtpRegister(email, otpCode) {
        const user = await database_services_1.default.users.findOne({ email, email_verify_token: otpCode });
        if (!user) {
            throw new Error('Mã OTP không hợp lệ hoặc tài khoản không tồn tại');
        }
        await database_services_1.default.users.updateOne({ _id: user._id }, {
            $set: {
                email_verify_token: '',
                verify: enums_1.UserVerifyStatus.Verified,
                updated_at: new Date()
            }
        });
        return { message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập.' };
    }
    async login(user_id, role, verify) {
        const [access_token, refresh_token] = await Promise.all([
            this.signAccessToken(user_id, role, verify),
            this.signRefreshToken(user_id, role, verify)
        ]);
        const decode_refresh = await (0, jwt_1.verifyToken)({
            token: refresh_token,
            secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN
        });
        await database_services_1.default.refreshTokens.insertOne({
            user_id: new mongodb_1.ObjectId(user_id),
            token: refresh_token,
            iat: new Date(decode_refresh.iat * 1000),
            exp: new Date(decode_refresh.exp * 1000),
            created_at: new Date()
        });
        return { access_token, refresh_token };
    }
    async logout(refresh_token) {
        await database_services_1.default.refreshTokens.deleteOne({ token: refresh_token });
        return { message: 'Đăng xuất thành công' };
    }
    async forgotPassword(email) {
        const user = await database_services_1.default.users.findOne({ email });
        if (!user)
            throw new Error('Không tìm thấy tài khoản với email này');
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await database_services_1.default.users.updateOne({ _id: user._id }, { $set: { forgot_password_token: otpCode, updated_at: new Date() } });
        await (0, mailer_1.sendForgotPasswordEmail)(user.email, user.name, otpCode);
        return { message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn' };
    }
    async resetPassword(email, otpCode, newPassword) {
        const user = await database_services_1.default.users.findOne({ email, forgot_password_token: otpCode });
        if (!user)
            throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');
        await database_services_1.default.users.updateOne({ _id: user._id }, {
            $set: {
                password: (0, crypto_1.hashPassword)(newPassword),
                forgot_password_token: '',
                updated_at: new Date()
            }
        });
        return { message: 'Đặt lại mật khẩu thành công!' };
    }
    async getMe(user_id) {
        const user = await database_services_1.default.users.findOne({ _id: new mongodb_1.ObjectId(user_id) }, { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } });
        return user;
    }
    async createAccessTokenFromRefresh(user_id, role, verify) {
        const access_token = await this.signAccessToken(user_id, role, verify);
        return { access_token };
    }
    async loginGoogle(idToken) {
        const { OAuth2Client } = await import('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        // Gọi API của Google để kiểm tra tính hợp lệ của idToken
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw new Error('Xác thực tài khoản Google thất bại từ phía máy chủ Google');
        }
        const { email, name } = payload;
        // Kiểm tra xem người dùng đã từng tồn tại trong hệ thống chưa
        const userInDb = await database_services_1.default.users.findOne({ email });
        // Khai báo các biến lưu thông tin cần thiết để tạo Token hệ thống
        let userIdStr;
        let userRole;
        let userVerify;
        if (!userInDb) {
            // Nếu chưa tồn tại, tự động tạo tài khoản mới dạng Google Login cho khách
            const userId = new mongodb_1.ObjectId();
            const newUser = new users_schemas_1.default({
                _id: userId,
                name: name || 'Google User',
                email: email,
                password: (0, crypto_1.hashPassword)(Math.random().toString(36).slice(-10)), // Mật khẩu ngẫu nhiên bảo mật
                phone_number: '',
                email_verify_token: '',
                verify: enums_1.UserVerifyStatus.Verified, // Mặc định tài khoản Google đã được xác thực email
                role: enums_1.UserRole.User
            });
            await database_services_1.default.users.insertOne(newUser);
            userIdStr = userId.toString();
            userRole = newUser.role;
            userVerify = newUser.verify;
        }
        else {
            userIdStr = userInDb._id.toString();
            userRole = userInDb.role;
            userVerify = userInDb.verify;
        }
        // Cấp cặp Token hệ thống cho ứng dụng di động Flutter duy trì phiên làm việc
        const tokens = await this.login(userIdStr, userRole, userVerify);
        return tokens;
    }
}
const userServices = new UserServices();
exports.default = userServices;
