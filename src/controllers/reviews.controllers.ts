import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/request/user.requests'
import { CreateReviewReqBody } from '~/models/request/reviews.requests'
import reviewServices from '~/services/reviews.services'

export const createReviewController = async (
  req: Request<ParamsDictionary, any, CreateReviewReqBody>,
  res: Response
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const result = await reviewServices.createReview(user_id, req.body)
  res.json(result)
}
