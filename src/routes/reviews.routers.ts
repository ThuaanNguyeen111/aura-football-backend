import { Router } from 'express'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { createReviewValidator } from '~/middlewares/reviews.middlewares'
import { createReviewController, getFieldReviewsController } from '~/controllers/reviews.controllers'

const reviewsRouter = Router()

// [POST] /reviews - Khách hàng đánh giá chất lượng sân
reviewsRouter.post('/', accessTokenValidator, createReviewValidator, WarpAsync(createReviewController))
// [GET] /reviews/field/:field_id - Lấy danh sách đánh giá của 1 sân
reviewsRouter.get('/field/:field_id', WarpAsync(getFieldReviewsController))
export default reviewsRouter
