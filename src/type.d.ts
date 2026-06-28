import { TokenPayload } from '~/models/requests/user.requests'
import User from '~/models/schema/users.schemas'

declare module 'express' {
  interface Request {
    user?: User
    decode_authorization?: TokenPayload
    decode_refresh_token?: TokenPayload
    decode_email_verify_token?: TokenPayload
    decode_forgot_password_token?: TokenPayload
  }
}
