import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'

export const getDailyBookingsValidator = validate(
  checkSchema(
    {
      date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày cần tra cứu' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601 (VD: 2026-06-28)' }
      }
    },
    ['query']
  )
)

export const revenueValidator = validate(
  checkSchema(
    {
      start_date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày bắt đầu' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601' }
      },
      end_date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Vui lòng cung cấp ngày kết thúc' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601' }
      }
    },
    ['query']
  )
)

export const forceCancelValidator = validate(
  checkSchema(
    {
      booking_id: {
        in: ['body'],
        notEmpty: { errorMessage: 'ID vé không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) throw new Error('ID vé không hợp lệ')
            return true
          }
        }
      },
      reason: {
        in: ['body'],
        notEmpty: { errorMessage: 'Vui lòng nhập lý do hủy vé' },
        isString: { errorMessage: 'Lý do phải là văn bản' }
      }
    },
    ['body']
  )
)
