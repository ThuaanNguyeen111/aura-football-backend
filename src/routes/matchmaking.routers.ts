import { Router } from 'express'
import { createMatchController, getOpenMatchesController } from '~/controllers/matchmaking.controllers'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const matchmakingRouter = Router()

// [POST] /matchmaking - Đăng kèo mới (Body cần booking_id, level, message)
matchmakingRouter.post('/', accessTokenValidator, WarpAsync(createMatchController))

// [GET] /matchmaking - Xem toàn bộ các kèo đang tìm đối thủ
matchmakingRouter.get('/', accessTokenValidator, WarpAsync(getOpenMatchesController))

export default matchmakingRouter
