import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import { ObjectId } from 'mongodb'

import { PaymentMethod } from '~/constants/enums'
export const getBusySlotsValidator = validate(
  checkSchema(
    {
      field_id: {
        in: ['query'],
        notEmpty: { errorMessage: 'ID sân bóng không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) {
              throw new Error('ID sân bóng không hợp lệ với định dạng MongoDB')
            }
            return true
          }
        }
      },
      date: {
        in: ['query'],
        notEmpty: { errorMessage: 'Ngày truy vấn không được để trống' },
        isISO8601: { errorMessage: 'Định dạng ngày phải là ISO8601 (Ví dụ: 2026-06-28)' }
      }
    },
    ['query']
  )
)

export const createBookingValidator = validate(
  checkSchema(
    {
      field_id: {
        notEmpty: { errorMessage: 'ID sân bóng không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) throw new Error('ID sân không hợp lệ')
            return true
          }
        }
      },
      start_time: {
        notEmpty: { errorMessage: 'Thời gian bắt đầu không được để trống' },
        isISO8601: { errorMessage: 'Định dạng thời gian phải là ISO8601' }
      },
      end_time: {
        notEmpty: { errorMessage: 'Thời gian kết thúc không được để trống' },
        isISO8601: { errorMessage: 'Định dạng thời gian phải là ISO8601' },
        custom: {
          options: (value, { req }) => {
            const startTime = new Date(req.body.start_time).getTime()
            const endTime = new Date(value).getTime()
            const durationHours = (endTime - startTime) / (1000 * 60 * 60)

            if (startTime >= endTime) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu')
            if (durationHours < 1.5) throw new Error('Khung giờ thuê tối thiểu là 1.5 giờ')
            return true
          }
        }
      },
      payment_method: {
        notEmpty: { errorMessage: 'Vui lòng chọn phương thức thanh toán' },
        isIn: {
          options: [[PaymentMethod.Cash, PaymentMethod.Transfer]],
          errorMessage: 'Phương thức thanh toán không hợp lệ'
        }
      }
    },
    ['body']
  )
)
export const cancelBookingValidator = validate(
  checkSchema(
    {
      booking_id: {
        notEmpty: { errorMessage: 'ID vé đặt sân không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) throw new Error('ID vé đặt sân không hợp lệ')
            return true
          }
        }
      }
    },
    ['body']
  )
)
// Thêm vào cuối file src/middlewares/bookings.middlewares.ts
export const rescheduleBookingValidator = validate(
  checkSchema(
    {
      booking_id: {
        notEmpty: { errorMessage: 'ID vé đặt sân không được để trống' },
        custom: {
          options: (value) => {
            if (!ObjectId.isValid(value)) throw new Error('ID vé đặt sân không hợp lệ')
            return true
          }
        }
      },
      start_time: {
        notEmpty: { errorMessage: 'Thời gian bắt đầu mới không được để trống' },
        isISO8601: { errorMessage: 'Định dạng thời gian phải là ISO8601' }
      },
      end_time: {
        notEmpty: { errorMessage: 'Thời gian kết thúc mới không được để trống' },
        isISO8601: { errorMessage: 'Định dạng thời gian phải là ISO8601' },
        custom: {
          options: (value, { req }) => {
            const startTime = new Date(req.body.start_time).getTime()
            const endTime = new Date(value).getTime()
            const durationHours = (endTime - startTime) / (1000 * 60 * 60)

            if (startTime >= endTime) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu')
            if (durationHours < 1.5) throw new Error('Khung giờ thuê tối thiểu là 1.5 giờ')
            return true
          }
        }
      }
    },
    ['body']
  )
)
