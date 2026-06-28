import { ObjectId } from 'mongodb'
import databaseService from './database.services'
import { hashPassword } from '~/utils/crypto'
import { signToken, verifyToken } from '~/utils/jwt'
import { sendOtpVerificationEmail, sendForgotPasswordEmail } from '~/utils/mailer'

import { UserRole, UserVerifyStatus } from '~/constants/enums'
import User from '~/models/schema/users.schemas'

class UserServices {
  private async signAccessToken(user_id: string, role: UserRole, verify: UserVerifyStatus): Promise<string> {
    return signToken({
      payload: { user_id, role, verify, token_type: 0 },
      options: { expiresIn: '30m' }, // Token sống 30 phút cho Flutter
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
    })
  }

  private async signRefreshToken(user_id: string, role: UserRole, verify: UserVerifyStatus): Promise<string> {
    return signToken({
      payload: { user_id, role, verify, token_type: 1 },
      options: { expiresIn: '7d' }, // Sống 7 ngày
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })
  }

  async checkEmailExist(email: string): Promise<boolean> {
    const result = await databaseService.users.findOne({ email })
    return Boolean(result)
  }

  async register(payload: { name: string; email: string; password: string; phone_number?: string }) {
    const user_id = new ObjectId()
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    await databaseService.users.insertOne(
      new User({
        _id: user_id,
        name: payload.name,
        email: payload.email,
        password: hashPassword(payload.password),
        phone_number: payload.phone_number,
        email_verify_token: otpCode, // Lưu OTP 6 số
        verify: UserVerifyStatus.Unverified,
        role: UserRole.User
      })
    )

    await sendOtpVerificationEmail(payload.email, payload.name, otpCode)
    return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP!' }
  }

  async verifyOtpRegister(email: string, otpCode: string) {
    const user = await databaseService.users.findOne({ email, email_verify_token: otpCode })
    if (!user) {
      throw new Error('Mã OTP không hợp lệ hoặc tài khoản không tồn tại')
    }

    await databaseService.users.updateOne(
      { _id: user._id },
      {
        $set: {
          email_verify_token: '',
          verify: UserVerifyStatus.Verified,
          updated_at: new Date()
        }
      }
    )
    return { message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập.' }
  }

  async login(user_id: string, role: UserRole, verify: UserVerifyStatus) {
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id, role, verify),
      this.signRefreshToken(user_id, role, verify)
    ])

    const decode_refresh = await verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
    })

    await databaseService.refreshTokens.insertOne({
      user_id: new ObjectId(user_id),
      token: refresh_token,
      iat: new Date(decode_refresh.iat * 1000),
      exp: new Date(decode_refresh.exp * 1000),
      created_at: new Date()
    })

    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return { message: 'Đăng xuất thành công' }
  }

  async forgotPassword(email: string) {
    const user = await databaseService.users.findOne({ email })
    if (!user) throw new Error('Không tìm thấy tài khoản với email này')

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    await databaseService.users.updateOne(
      { _id: user._id },
      { $set: { forgot_password_token: otpCode, updated_at: new Date() } }
    )

    await sendForgotPasswordEmail(user.email, user.name, otpCode)
    return { message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn' }
  }

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const user = await databaseService.users.findOne({ email, forgot_password_token: otpCode })
    if (!user) throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn')

    await databaseService.users.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashPassword(newPassword),
          forgot_password_token: '',
          updated_at: new Date()
        }
      }
    )
    return { message: 'Đặt lại mật khẩu thành công!' }
  }

  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      { projection: { password: 0, email_verify_token: 0, forgot_password_token: 0 } }
    )
    return user
  }

  async createAccessTokenFromRefresh(user_id: string, role: UserRole, verify: UserVerifyStatus) {
    const access_token = await this.signAccessToken(user_id, role, verify)
    return { access_token }
  }
  async loginGoogle(idToken: string) {
    const { OAuth2Client } = await import('google-auth-library')
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

    // Gọi API của Google để kiểm tra tính hợp lệ của idToken
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      throw new Error('Xác thực tài khoản Google thất bại từ phía máy chủ Google')
    }

    const { email, name } = payload

    // Kiểm tra xem người dùng đã từng tồn tại trong hệ thống chưa
    const userInDb = await databaseService.users.findOne({ email })

    // Khai báo các biến lưu thông tin cần thiết để tạo Token hệ thống
    let userIdStr: string
    let userRole: number
    let userVerify: number

    if (!userInDb) {
      // Nếu chưa tồn tại, tự động tạo tài khoản mới dạng Google Login cho khách
      const userId = new ObjectId()
      const newUser = new User({
        _id: userId,
        name: name || 'Google User',
        email: email,
        password: hashPassword(Math.random().toString(36).slice(-10)), // Mật khẩu ngẫu nhiên bảo mật
        phone_number: '',
        email_verify_token: '',
        verify: UserVerifyStatus.Verified, // Mặc định tài khoản Google đã được xác thực email
        role: UserRole.User
      })

      await databaseService.users.insertOne(newUser)

      userIdStr = userId.toString()
      userRole = newUser.role
      userVerify = newUser.verify
    } else {
      userIdStr = (userInDb._id as ObjectId).toString()
      userRole = userInDb.role
      userVerify = userInDb.verify
    }

    // Cấp cặp Token hệ thống cho ứng dụng di động Flutter duy trì phiên làm việc
    const tokens = await this.login(userIdStr, userRole, userVerify)
    return tokens
  }
}

const userServices = new UserServices()
export default userServices
