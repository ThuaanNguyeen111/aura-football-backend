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
  async getFieldById(field_id: string) {
    const field = await databaseService.fields.findOne({ _id: new ObjectId(field_id) })
    if (!field) throw new Error('Không tìm thấy sân bóng')
    return field
  }
  async getAllFields() {
    // Trả về danh sách tất cả các sân đang hoạt động cho App Flutter
    return await databaseService.fields.find({ is_active: true }).toArray()
  }
  // Thay thế hoặc thêm hàm này vào class FieldServices
  async getFields(query: any) {
    const { type, max_price, lat, lng, radius } = query

    // 1. Xây dựng bộ lọc cơ bản (Active)
    const filter: any = { is_active: true }

    // 2. Lọc theo loại sân (5 hoặc 7 người)
    if (type) {
      filter.type = Number(type)
    }

    // 3. Lọc theo mức giá tối đa
    if (max_price) {
      filter.price_per_hour = { $lte: Number(max_price) }
    }

    // 4. Nếu có tọa độ Map -> Dùng Aggregate $geoNear
    if (lat && lng) {
      const maxDistanceInMeters = (Number(radius) || 5) * 1000 // Mặc định 5km
      const fields = await databaseService.fields
        .aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
              distanceField: 'distance',
              maxDistance: maxDistanceInMeters,
              spherical: true,
              query: filter // Kết hợp bộ lọc giá/loại sân vào Map
            }
          },
          { $sort: { distance: 1 } } // Sắp xếp gần nhất lên đầu
        ])
        .toArray()
      return fields
    }

    // 5. Nếu không có tọa độ Map -> Query bình thường
    return await databaseService.fields.find(filter).sort({ created_at: -1 }).toArray()
  }
}

const fieldServices = new FieldServices()
export default fieldServices
