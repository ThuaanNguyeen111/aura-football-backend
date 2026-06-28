import { Router } from 'express'
import { WarpAsync } from '~/utils/handlers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { createReviewValidator } from '~/middlewares/reviews.middlewares'
import { createReviewController } from '~/controllers/reviews.controllers'

const reviewsRouter = Router()

// [POST] /reviews - Khách hàng đánh giá chất lượng sân
reviewsRouter.post('/', accessTokenValidator, createReviewValidator, WarpAsync(createReviewController))

export default reviewsRouter
