import { ObjectId } from 'mongodb'
import { UserRole, UserVerifyStatus } from '~/constants/enums'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  phone_number?: string
  wallet_balance?: number
  has_booked_before?: boolean
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string
  forgot_password_token?: string
  verify?: UserVerifyStatus
  role?: UserRole
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  phone_number: string
  wallet_balance: number
  has_booked_before: boolean
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus
  role: UserRole

  constructor(user: UserType) {
    const now = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name
    this.email = user.email
    this.password = user.password
    this.phone_number = user.phone_number || ''
    this.wallet_balance = user.wallet_balance || 0
    this.has_booked_before = user.has_booked_before || false
    this.created_at = user.created_at || now
    this.updated_at = user.updated_at || now
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.role = user.role || UserRole.User
  }
}
