import { RequestHandler, NextFunction, Response, Request } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

export const WarpAsync = <
  P extends ParamsDictionary = ParamsDictionary,
  ResBody = Record<string, unknown>,
  ReqBody = Record<string, unknown>,
  ReqQuery = qs.ParsedQs
>(
  fn: RequestHandler<P, ResBody, ReqBody, ReqQuery>
) => {
  return async (req: Request<P, ResBody, ReqBody, ReqQuery>, res: Response<ResBody>, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
