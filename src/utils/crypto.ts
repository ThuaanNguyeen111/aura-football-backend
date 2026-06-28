import { createHash } from 'crypto'
import { config } from 'dotenv'

config()

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex')
}

export function hashPassword(password: string): string {
  const secret = process.env.PASSWORD_SECRET
  if (!secret) {
    throw new Error('PASSWORD_SECRET is not defined in .env')
  }
  return sha256(password + secret)
}
