"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAuthController = exports.refreshAccessTokenController = exports.getMeController = exports.resetPasswordController = exports.forgotPasswordController = exports.logoutController = exports.loginController = exports.verifyOtpRegisterController = exports.registerController = void 0;
const users_services_1 = __importDefault(require("../services/users.services"));
const message_1 = require("../constants/message");
const registerController = async (req, res) => {
    const result = await users_services_1.default.register(req.body);
    res.json({ result }); // Trả thẳng JSON[cite: 41]
};
exports.registerController = registerController;
const verifyOtpRegisterController = async (req, res) => {
    const { email, otpCode } = req.body;
    const result = await users_services_1.default.verifyOtpRegister(email, otpCode);
    res.json({ result });
};
exports.verifyOtpRegisterController = verifyOtpRegisterController;
const loginController = async (req, res) => {
    const user = req.user;
    const user_id = user._id?.toString(); // Lấy user_id chuẩn[cite: 41]
    const result = await users_services_1.default.login(user_id, user.role, user.verify);
    res.json({ message: message_1.USERS_MESSAGES.LOGIN_SUCCESS, result });
};
exports.loginController = loginController;
const logoutController = async (req, res) => {
    const { refresh_token } = req.body;
    const result = await users_services_1.default.logout(refresh_token);
    res.json({ result });
};
exports.logoutController = logoutController;
const forgotPasswordController = async (req, res) => {
    const { email } = req.body;
    const result = await users_services_1.default.forgotPassword(email);
    res.json({ result });
};
exports.forgotPasswordController = forgotPasswordController;
const resetPasswordController = async (req, res) => {
    const { email, otpCode, password } = req.body;
    const result = await users_services_1.default.resetPassword(email, otpCode, password);
    res.json({ result });
};
exports.resetPasswordController = resetPasswordController;
const getMeController = async (req, res) => {
    const { user_id } = req.decode_authorization; // Lấy ID từ token đã giải mã[cite: 41]
    const user = await users_services_1.default.getMe(user_id);
    res.json({ message: message_1.USERS_MESSAGES.GET_ME_SUCCESS, result: user });
};
exports.getMeController = getMeController;
const refreshAccessTokenController = async (req, res) => {
    const { user_id, role, verify } = req.decode_refresh_token;
    const result = await users_services_1.default.createAccessTokenFromRefresh(user_id, role, verify);
    res.json({ message: 'Làm mới Access Token thành công', result });
};
exports.refreshAccessTokenController = refreshAccessTokenController;
const googleOAuthController = async (req, res) => {
    const { idToken } = req.body;
    const result = await users_services_1.default.loginGoogle(idToken);
    res.json({
        message: 'Đăng nhập tài khoản Google thành công',
        result
    });
};
exports.googleOAuthController = googleOAuthController;
