import { Router } from 'express'
import { checkVoucherController } from '~/controllers/vouchers.controllers'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const vouchersRouter = Router()

// [GET] /vouchers/check?code=SUMMER20&base_price=300000 - Khách hàng kiểm tra mã
vouchersRouter.get('/check', accessTokenValidator, WarpAsync(checkVoucherController))

export default vouchersRouter
