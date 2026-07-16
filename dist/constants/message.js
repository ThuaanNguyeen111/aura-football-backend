"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOOKING_MESSAGES = exports.USERS_MESSAGES = void 0;
exports.USERS_MESSAGES = {
    VALIDATION_ERROR: 'Lỗi xác thực dữ liệu đầu vào',
    // Name
    NAME_IS_REQUIRED: 'Tên không được để trống',
    NAME_MUST_BE_A_STRING: 'Tên phải là một chuỗi ký tự',
    NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Tên phải có độ dài từ 1 đến 100 ký tự',
    // Email
    EMAIL_ALREADY_EXISTS: 'Email này đã được đăng ký',
    EMAIL_IS_REQUIRED: 'Email không được để trống',
    EMAIL_IS_INVALID: 'Định dạng email không hợp lệ',
    // Password
    PASSWORD_IS_REQUIRED: 'Mật khẩu không được để trống',
    PASSWORD_MUST_BE_A_STRING: 'Mật khẩu phải là một chuỗi ký tự',
    PASSWORD_LENGTH_MUST_BE_FROM_8_TO_50: 'Mật khẩu phải từ 8 đến 50 ký tự',
    PASSWORD_MUST_BE_STRONG: 'Mật khẩu phải dài ít nhất 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt',
    // Confirm Password
    CONFIRM_PASSWORD_IS_REQUIRED: 'Vui lòng xác nhận mật khẩu',
    CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Xác nhận mật khẩu phải là một chuỗi',
    CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Mật khẩu xác nhận không khớp',
    // Auth & Token
    ACCESS_TOKEN_IS_REQUIRED: 'Access token là bắt buộc',
    REFRESH_TOKEN_IS_REQUIRED: 'Refresh token là bắt buộc',
    USED_REFRESH_TOKEN_OR_NOT_EXIST: 'Refresh token đã được sử dụng hoặc không tồn tại',
    EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Token xác thực email là bắt buộc',
    FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Token khôi phục mật khẩu là bắt buộc',
    USED_FORGOT_PASSWORD_INCORRECT: 'Token khôi phục mật khẩu không chính xác',
    // Actions
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    EMAIL_VERIFY_SUCCESS: 'Xác thực email thành công',
    CHECK_EMAIL_TO_RESET_PASSWORD: 'Vui lòng kiểm tra email để đặt lại mật khẩu',
    RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công',
    USER_NOT_FOUND: 'Không tìm thấy người dùng',
    USER_NOT_VERIFIED: 'Tài khoản chưa được xác thực',
    EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email hoặc mật khẩu không chính xác',
    GET_ME_SUCCESS: 'Lấy thông tin thành công'
};
exports.BOOKING_MESSAGES = {
    FIELD_ID_IS_REQUIRED: 'Mã sân không được để trống',
    START_TIME_IS_REQUIRED: 'Thời gian bắt đầu là bắt buộc',
    END_TIME_IS_REQUIRED: 'Thời gian kết thúc là bắt buộc',
    TIME_SLOT_INVALID: 'Khung giờ không hợp lệ (tối thiểu 1h30p)',
    FIELD_ALREADY_BOOKED: 'Sân đã được đặt trong khung giờ này, vui lòng chọn giờ khác'
};
