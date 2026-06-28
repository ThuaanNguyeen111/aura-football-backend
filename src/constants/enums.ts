export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum UserRole {
  User, // 0: Khách hàng đặt sân
  Admin // 1: Quản trị viên hệ thống
}

export enum TokenTypes {
  AccessToken,
  RefreshToken,
  EmailVerificationToken,
  ForgotPasswordToken
}

export enum FieldType {
  Pitch5 = 5,
  Pitch7 = 7
}

export enum BookingStatus {
  Pending = 0, // Đang chờ thanh toán (Slot đang bị Hold/Giữ chỗ)
  Confirmed = 1, // Đã thanh toán thành công
  Cancelled = 2, // Đã hủy vé
  Completed = 3 // Đã Check-in và sử dụng sân xong
}
export enum PaymentMethod {
  Cash = 0, // Thanh toán tại sân (Xác nhận ngay)
  Transfer = 1 // Chuyển khoản (Đưa vào trạng thái Pending chờ thanh toán)
}
