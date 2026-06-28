import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenPayload } from '~/models/request/user.requests'

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | Buffer | object
  privateKey: string
  options?: SignOptions
}): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err)
      resolve(token as string)
    })
  })
}

export const verifyToken = ({
  token,
  secretOrPublicKey
}: {
  token: string
  secretOrPublicKey: string
}): Promise<TokenPayload> => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      if (err) throw reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
