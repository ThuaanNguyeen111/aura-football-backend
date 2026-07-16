import { Request, Response } from 'express'
import matchmakingServices from '~/services/matchmaking.services'
import { TokenPayload } from '~/models/request/user.requests'

export const createMatchController = async (req: Request, res: Response) => {
  // Ép kiểu chuẩn xác để lấy user_id
  const tokenPayload = req.decode_authorization as TokenPayload
  const user_id = tokenPayload.user_id

  const result = await matchmakingServices.createMatch(user_id, req.body)
  res.json({ message: 'Đăng bài tìm đối thủ thành công', result })
}

export const getOpenMatchesController = async (req: Request, res: Response) => {
  const result = await matchmakingServices.getOpenMatches()
  res.json({ message: 'Lấy danh sách các kèo đang mở thành công', result })
}
