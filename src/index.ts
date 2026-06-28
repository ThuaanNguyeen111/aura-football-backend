import { config } from 'dotenv'
config()
import express from 'express'
import cors from 'cors'
import { startCleanupPendingBookingsJob } from '~/utils/cronjobs'
import databaseService from '~/services/database.services'
import usersRouter from '~/routes/users.routers'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import fieldsRouter from '~/routes/fields.routers'
import bookingsRouter from '~/routes/bookings.routers'
import reviewsRouter from './routes/reviews.routers'
import adminRouter from '~/routes/admin.routers'
const app = express()
const PORT = process.env.PORT || 4000

// Middleware parse JSON
app.use(express.json())

// Cấu hình CORS cho phép Flutter App gọi API thoải mái
app.use(
  cors({
    origin: '*',
    credentials: true
  })
)

// Kết nối Native MongoDB
databaseService.connect()

// Định tuyến API
app.use('/admin', adminRouter)
app.use('/users', usersRouter)
app.use('/fields', fieldsRouter)
app.use('/bookings', bookingsRouter)
// Middleware bẫy lỗi tổng (Bắt buộc phải nằm dưới cùng)
app.use('/reviews', reviewsRouter)
app.use(defaultErrorHandler)

startCleanupPendingBookingsJob() // Kích hoạt hệ thống dọn rác ngầm
app.listen(PORT, () => {
  console.log(`🚀 Aura Football Booking API đang chạy trơn tru trên port ${PORT}`)
})
