import { Request, Response } from 'express'
import fieldServices from '~/services/fields.services'

export const seedFieldsController = async (req: Request, res: Response) => {
  const result = await fieldServices.seedFields()
  res.json({ result })
}

export const getAllFieldsController = async (req: Request, res: Response) => {
  const result = await fieldServices.getAllFields()
  res.json({
    message: 'Lấy danh sách sân bóng thành công',
    result
  })
}
