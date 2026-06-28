import { ObjectId } from 'mongodb'
import databaseService from '~/services/database.services'
import Field from '~/models/schema/fields.schemas'
import { FieldType } from '~/constants/enums'

class FieldServices {
  async seedFields() {
    // Kiểm tra xem database đã có dữ liệu sân chưa để tránh bị duplicate
    const count = await databaseService.fields.countDocuments()
    if (count > 0) {
      return { message: 'Dữ liệu sân đã tồn tại, không cần khởi tạo lại!' }
    }

    // 1. Khởi tạo 4 Sân 5 người với ID tự động sinh trước
    const fieldA = new Field({
      name: 'Sân 5 - A',
      type: FieldType.Pitch5,
      price_per_hour: 150000,
      amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
    })
    const fieldB = new Field({
      name: 'Sân 5 - B',
      type: FieldType.Pitch5,
      price_per_hour: 150000,
      amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
    })
    const fieldC = new Field({
      name: 'Sân 5 - C',
      type: FieldType.Pitch5,
      price_per_hour: 150000,
      amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
    })
    const fieldD = new Field({
      name: 'Sân 5 - D',
      type: FieldType.Pitch5,
      price_per_hour: 150000,
      amenities: ['Nước suối', 'Bóng thi đấu', 'Ghế ngồi']
    })

    await databaseService.fields.insertMany([fieldA, fieldB, fieldC, fieldD])

    // 2. Khởi tạo 2 Sân 7 người (Ghép từ A+B và C+D)
    // Thuộc tính linked_field_ids chính là chìa khóa để chặn trùng lịch sau này
    const field7_1 = new Field({
      name: 'Sân 7 - VIP 1',
      type: FieldType.Pitch7,
      price_per_hour: 350000, // Giá Sân 7 thường cao hơn tổng 2 Sân 5
      amenities: ['Trọng tài', 'Nước suối', 'Bóng thi đấu VIP', 'Khán đài'],
      linked_field_ids: [fieldA._id as ObjectId, fieldB._id as ObjectId]
    })

    const field7_2 = new Field({
      name: 'Sân 7 - VIP 2',
      type: FieldType.Pitch7,
      price_per_hour: 350000,
      amenities: ['Trọng tài', 'Nước suối', 'Bóng thi đấu VIP', 'Khán đài'],
      linked_field_ids: [fieldC._id as ObjectId, fieldD._id as ObjectId]
    })

    await databaseService.fields.insertMany([field7_1, field7_2])

    return { message: 'Đã khởi tạo thành công hệ thống 6 sân bóng!' }
  }

  async getAllFields() {
    // Trả về danh sách tất cả các sân đang hoạt động cho App Flutter
    return await databaseService.fields.find({ is_active: true }).toArray()
  }
}

const fieldServices = new FieldServices()
export default fieldServices
