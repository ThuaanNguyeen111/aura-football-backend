import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import databaseService from '~/services/database.services'
import userServices from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { verifyToken } from '~/utils/jwt'
import { UserRole, UserVerifyStatus } from '~/constants/enums'
import { TokenPayload } from '~/models/request/user.requests'
import { ObjectId } from 'mongodb'

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: { errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED },
        isString: { errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING },
        trim: true
      },
      email: {
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value) => {
            const isExist = await userServices.checkEmailExist(value)
            if (isExist) throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            return true
          }
        }
      },
      password: {
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        isLength: { options: { min: 6 }, errorMessage: 'Mật khẩu phải dài ít nhất 6 ký tự' }
      }
    },
    ['body']
  )
)

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const hashedPassword = hashPassword(req.body.password)
            const user = await databaseService.users.findOne({ email: value, password: hashedPassword })

            if (!user) throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)

            // 🔥 Logic chặn tài khoản bị Banned
            if (user.verify === UserVerifyStatus.Banned) {
              throw new Error('Tài khoản của bạn đã bị khóa do vi phạm quy định. Vui lòng liên hệ Ban quản lý!')
            }

            req.user = user // Nhét user vào req để Controller dùng
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const accessToken = value.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decode_authorization = decoded
            } catch (error) {
              throw new ErrorWithStatus({
                message: 'Token hết hạn hoặc không hợp lệ',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            try {
              const [decoded, refreshTokenDb] = await Promise.all([
                verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value })
              ])

              if (!refreshTokenDb) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }

              // 🔥 LOGIC CHẶN TÀI KHOẢN BỊ KHÓA NGAY KHI LÀM MỚI TOKEN
              const user = await databaseService.users.findOne({ _id: new ObjectId(decoded.user_id) })
              if (user?.verify === UserVerifyStatus.Banned) {
                throw new ErrorWithStatus({
                  message: 'Tài khoản của bạn đã bị khóa do vi phạm quy định!',
                  status: HTTP_STATUS.FORBIDDEN
                })
              }

              ;(req as Request).decode_refresh_token = decoded
            } catch (error) {
              // 🔥 Đảm bảo giữ nguyên các lỗi hệ thống tự ném ra (như lỗi Banned ở trên)
              if (error instanceof ErrorWithStatus) {
                throw error
              }

              // Nếu là lỗi do thư viện jsonwebtoken ném ra thì báo token hết hạn
              throw new ErrorWithStatus({
                message: 'Refresh token lỗi hoặc đã hết hạn',
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }

            return true
          }
        }
      }
    },
    ['body']
  )
)
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true
      }
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: { errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED },
        isEmail: { errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID },
        trim: true
      },
      otpCode: {
        notEmpty: { errorMessage: 'Mã OTP không được để trống' },
        isLength: { options: { min: 6, max: 6 }, errorMessage: 'Mã OTP phải có đúng 6 chữ số' },
        trim: true
      },
      password: {
        notEmpty: { errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED },
        isString: { errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING },
        isLength: { options: { min: 6 }, errorMessage: 'Mật khẩu mới phải dài ít nhất 6 ký tự' }
      }
    },
    ['body']
  )
)

export const googleOAuthValidator = validate(
  checkSchema(
    {
      idToken: {
        notEmpty: { errorMessage: 'Mã idToken từ Google gửi lên không được để trống' },
        trim: true
      }
    },
    ['body']
  )
)
export const adminValidator = (req: Request, res: Response, next: NextFunction) => {
  const { user_role } = req.decode_authorization as TokenPayload
  if (user_role !== UserRole.Admin) {
    return res.status(403).json({
      message: 'Quyền truy cập bị từ chối. Chức năng này chỉ dành cho Ban quản lý (Admin)!'
    })
  }
  next()
}
export const depositWalletValidator = validate(
  checkSchema(
    {
      amount: {
        notEmpty: { errorMessage: 'Vui lòng nhập số tiền cần nạp' },
        isNumeric: { errorMessage: 'Số tiền nạp phải là dạng số' },
        custom: {
          options: (value) => {
            if (value <= 0) throw new Error('Số tiền nạp phải lớn hơn 0')
            return true
          }
        }
      }
    },
    ['body']
  )
)
