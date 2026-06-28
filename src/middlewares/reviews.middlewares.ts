import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'

export const createReviewValidator = validate(
  checkSchema(
    {
      booking_id: {
        notEmpty: { errorMessage: 'ID vé không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) throw new Error('ID vé không hợp lệ')
            return true
          }
        }
      },
      rating: {
        notEmpty: { errorMessage: 'Vui lòng chọn số sao đánh giá' },
        isInt: {
          options: { min: 1, max: 5 },
          errorMessage: 'Điểm đánh giá phải từ 1 đến 5 sao'
        }
      },
      comment: {
        optional: true,
        isString: { errorMessage: 'Bình luận phải là chuỗi văn bản' },
        trim: true
      }
    },
    ['body']
  )
)
