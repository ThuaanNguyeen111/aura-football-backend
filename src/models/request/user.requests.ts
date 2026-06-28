import { JwtPayload } from 'jsonwebtoken'
import { TokenTypes, UserVerifyStatus, UserRole } from '~/constants/enums'

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenTypes
  verify: UserVerifyStatus
  role: UserRole
  exp: number
  iat: number
}
