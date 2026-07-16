import { Router } from 'express'
import {
  depositWalletController,
  forgotPasswordController,
  getMeController,
  googleOAuthController,
  loginController,
  logoutController,
  refreshAccessTokenController,
  registerController,
  resetPasswordController,
  updateMeController,
  verifyOtpRegisterController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  depositWalletValidator,
  forgotPasswordValidator,
  googleOAuthValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator
} from '~/middlewares/users.middlewares'
import { WarpAsync } from '~/utils/handlers'

const usersRouter = Router()

// 1. [POST] /users/register - Đăng ký tài khoản mới bằng email
usersRouter.post('/register', registerValidator, WarpAsync(registerController))

// 2. [POST] /users/verify-otp - Xác thực mã số OTP kích hoạt tài khoản
usersRouter.post('/verify-otp', WarpAsync(verifyOtpRegisterController))

// 3. [POST] /users/login - Đăng nhập tài khoản bằng email + mật khẩu
usersRouter.post('/login', loginValidator, WarpAsync(loginController))

// 4. [POST] /users/google-oauth - Đăng nhập bằng tài khoản Google dành cho Flutter
usersRouter.post('/google-oauth', googleOAuthValidator, WarpAsync(googleOAuthController))

// 5. [POST] /users/logout - Đăng xuất tài khoản, thu hồi Refresh Token
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, WarpAsync(logoutController))

// 6. [POST] /users/forgot-password - Yêu cầu quên mật khẩu (Gửi OTP khôi phục)
usersRouter.post('/forgot-password', forgotPasswordValidator, WarpAsync(forgotPasswordController))

// 7. [POST] /users/reset-password - Cung cấp OTP và thiết lập mật khẩu mới
usersRouter.post('/reset-password', resetPasswordValidator, WarpAsync(resetPasswordController))

// 8. [GET] /users/me - Lấy thông tin tài khoản cá nhân của người dùng di động
usersRouter.get('/me', accessTokenValidator, WarpAsync(getMeController))

// [PUT] /users/update-me - Cập nhật hồ sơ
usersRouter.put('/update-me', accessTokenValidator, WarpAsync(updateMeController))
// 9. [POST] /users/refresh-token - Cơ chế tự động làm mới mã Access Token âm thầm
usersRouter.post('/refresh-token', refreshTokenValidator, WarpAsync(refreshAccessTokenController))

// 10. [POST] /users/wallet/deposit - Nạp tiền giả lập vào ví
usersRouter.post('/wallet/deposit', accessTokenValidator, depositWalletValidator, WarpAsync(depositWalletController))
export default usersRouter
