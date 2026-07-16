import { Request, Response } from 'express'
import fieldServices from '~/services/fields.services'

export const seedFieldsController = async (req: Request, res: Response) => {
  const result = await fieldServices.seedFields()
  res.json({ result })
}

export const getAllFieldsController = async (req: Request, res: Response) => {
  // Lấy toàn bộ query params (type, max_price, lat, lng, radius)
  const query = req.query

  const result = await fieldServices.getFields(query)

  res.json({
    message: 'Lấy danh sách sân bóng thành công',
    result
  })
}

export const getFieldByIdController = async (req: Request<{ field_id: string }>, res: Response) => {
  const result = await fieldServices.getFieldById(req.params.field_id)
  res.json({ message: 'Lấy thông tin sân thành công', result })
}
