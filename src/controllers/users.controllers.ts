import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import userServices from '~/services/users.services'
import { USERS_MESSAGES } from '~/constants/message'
import User from '~/models/schema/users.schemas'
import { TokenPayload } from '~/models/request/user.requests'

export const registerController = async (req: Request, res: Response) => {
  const result = await userServices.register(req.body)
  res.json({ result }) // Trả thẳng JSON[cite: 41]
}

export const verifyOtpRegisterController = async (req: Request, res: Response) => {
  const { email, otpCode } = req.body
  const result = await userServices.verifyOtpRegister(email, otpCode)
  res.json({ result })
}

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id?.toString() as string // Lấy user_id chuẩn[cite: 41]

  const result = await userServices.login(user_id, user.role, user.verify)
  res.json({ message: USERS_MESSAGES.LOGIN_SUCCESS, result })
}

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const result = await userServices.logout(refresh_token)
  res.json({ result })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const { email } = req.body
  const result = await userServices.forgotPassword(email)
  res.json({ result })
}
export const updateMeController = async (req: Request, res: Response) => {
  const tokenPayload = req.decode_authorization as TokenPayload
  const result = await userServices.updateMe(tokenPayload.user_id, req.body)
  res.json(result)
}
export const resetPasswordController = async (req: Request, res: Response) => {
  const { email, otpCode, password } = req.body
  const result = await userServices.resetPassword(email, otpCode, password)
  res.json({ result })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decode_authorization as TokenPayload // Lấy ID từ token đã giải mã
  const user = await userServices.getMe(user_id)
  if (user) {
    res.json({
      message: USERS_MESSAGES.GET_ME_SUCCESS,
      result: {
        ...user,
        user_role: user.role // Thêm alias user_role phục vụ Flutter Mobile App
      }
    })
    return
  }
  res.json({ message: USERS_MESSAGES.GET_ME_SUCCESS, result: user })
}

export const refreshAccessTokenController = async (req: Request, res: Response) => {
  const { user_id, role, verify } = req.decode_refresh_token as TokenPayload
  const result = await userServices.createAccessTokenFromRefresh(user_id, role, verify)
  res.json({ message: 'Làm mới Access Token thành công', result })
}
export const googleOAuthController = async (req: Request, res: Response) => {
  const { idToken } = req.body
  const result = await userServices.loginGoogle(idToken)
  res.json({
    message: 'Đăng nhập tài khoản Google thành công',
    result
  })
}

// Bạn nhớ import TokenPayload ở đầu file nếu chưa có nhé:
// import { TokenPayload } from '~/models/request/user.requests'

export const depositWalletController = async (req: Request, res: Response) => {
  // Lấy user_id từ Token
  const tokenPayload = req.decode_authorization as TokenPayload
  const user_id = tokenPayload.user_id

  // Ép kiểu amount thành số Number
  const amount = Number(req.body.amount)

  const result = await userServices.depositToWallet(user_id, amount)
  res.json(result)
}
