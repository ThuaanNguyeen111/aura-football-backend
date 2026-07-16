import { ObjectId } from 'mongodb'
import { FieldType } from '~/constants/enums'

// 1. Khai báo interface cho tọa độ Map
interface LocationType {
  type: string // Bắt buộc là 'Point'
  coordinates: number[] // [Kinh độ (lng), Vĩ độ (lat)]
}

interface FieldTypeSchema {
  _id?: ObjectId
  name: string
  type: FieldType
  price_per_hour: number
  amenities: string[]
  linked_field_ids?: ObjectId[]
  opening_time?: string
  closing_time?: string
  is_active?: boolean
  address?: string // 🔥 Thêm địa chỉ dạng text
  location?: LocationType // 🔥 Thêm tọa độ
  created_at?: Date
  updated_at?: Date
}

export default class Field {
  _id: ObjectId
  name: string
  type: FieldType
  price_per_hour: number
  amenities: string[]
  linked_field_ids: ObjectId[]
  opening_time: string
  closing_time: string
  is_active: boolean
  address: string
  location: LocationType
  created_at: Date
  updated_at: Date

  constructor(field: FieldTypeSchema) {
    this._id = field._id || new ObjectId()
    this.name = field.name
    this.type = field.type
    this.price_per_hour = field.price_per_hour
    this.amenities = field.amenities || []
    this.linked_field_ids = field.linked_field_ids || []
    this.opening_time = field.opening_time || '06:00'
    this.closing_time = field.closing_time || '22:00'
    this.is_active = field.is_active !== undefined ? field.is_active : true

    // 🔥 Gán giá trị mặc định nếu chưa có
    this.address = field.address || ''
    this.location = field.location || { type: 'Point', coordinates: [0, 0] }

    this.created_at = field.created_at || new Date()
    this.updated_at = field.updated_at || new Date()
  }
}
