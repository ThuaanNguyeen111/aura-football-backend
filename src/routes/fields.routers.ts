import { Router } from 'express'
import { getAllFieldsController, seedFieldsController } from '~/controllers/fields.controllers'
import { WarpAsync } from '~/utils/handlers'

const fieldsRouter = Router()

// [POST] /fields/seed - Khởi tạo dữ liệu gốc (Chỉ gọi 1 lần để setup DB)
fieldsRouter.post('/seed', WarpAsync(seedFieldsController))

// [GET] /fields - Lấy danh sách toàn bộ sân bóng (Dành cho màn hình Home Flutter)
fieldsRouter.get('/', WarpAsync(getAllFieldsController))

export default fieldsRouter
