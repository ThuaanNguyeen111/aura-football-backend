"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethod = exports.BookingStatus = exports.FieldType = exports.TokenTypes = exports.UserRole = exports.UserVerifyStatus = void 0;
var UserVerifyStatus;
(function (UserVerifyStatus) {
    UserVerifyStatus[UserVerifyStatus["Unverified"] = 0] = "Unverified";
    UserVerifyStatus[UserVerifyStatus["Verified"] = 1] = "Verified";
    UserVerifyStatus[UserVerifyStatus["Banned"] = 2] = "Banned"; // bị khóa
})(UserVerifyStatus || (exports.UserVerifyStatus = UserVerifyStatus = {}));
var UserRole;
(function (UserRole) {
    UserRole[UserRole["User"] = 0] = "User";
    UserRole[UserRole["Admin"] = 1] = "Admin"; // 1: Quản trị viên hệ thống
})(UserRole || (exports.UserRole = UserRole = {}));
var TokenTypes;
(function (TokenTypes) {
    TokenTypes[TokenTypes["AccessToken"] = 0] = "AccessToken";
    TokenTypes[TokenTypes["RefreshToken"] = 1] = "RefreshToken";
    TokenTypes[TokenTypes["EmailVerificationToken"] = 2] = "EmailVerificationToken";
    TokenTypes[TokenTypes["ForgotPasswordToken"] = 3] = "ForgotPasswordToken";
})(TokenTypes || (exports.TokenTypes = TokenTypes = {}));
var FieldType;
(function (FieldType) {
    FieldType[FieldType["Pitch5"] = 5] = "Pitch5";
    FieldType[FieldType["Pitch7"] = 7] = "Pitch7";
})(FieldType || (exports.FieldType = FieldType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus[BookingStatus["Pending"] = 0] = "Pending";
    BookingStatus[BookingStatus["Confirmed"] = 1] = "Confirmed";
    BookingStatus[BookingStatus["Cancelled"] = 2] = "Cancelled";
    BookingStatus[BookingStatus["Completed"] = 3] = "Completed"; // Đã Check-in và sử dụng sân xong
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod[PaymentMethod["Cash"] = 0] = "Cash";
    PaymentMethod[PaymentMethod["Transfer"] = 1] = "Transfer"; // Chuyển khoản (Đưa vào trạng thái Pending chờ thanh toán)
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
