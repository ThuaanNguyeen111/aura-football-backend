import { ObjectId } from 'mongodb'
import { FieldType } from '~/constants/enums'

interface FieldTypeSchema {
  _id?: ObjectId
  name: string
  type: FieldType
  price_per_hour: number
  amenities: string[]
  linked_field_ids?: ObjectId[] // Dùng cho Sân 7 để liên kết 2 Sân 5
  opening_time?: string // Ví dụ: '06:00'
  closing_time?: string // Ví dụ: '22:00'
  is_active?: boolean
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
  created_at: Date
  updated_at: Date

  constructor(field: FieldTypeSchema) {
    this._id = field._id || new ObjectId()
    this.name = field.name
    this.type = field.type
    this.price_per_hour = field.price_per_hour
    this.amenities = field.amenities || []
    this.linked_field_ids = field.linked_field_ids || []
    this.opening_time = field.opening_time || '06:00' // Mặc định mở lúc 6h sáng
    this.closing_time = field.closing_time || '22:00' // Mặc định đóng lúc 10h tối
    this.is_active = field.is_active !== undefined ? field.is_active : true
    this.created_at = field.created_at || new Date()
    this.updated_at = field.updated_at || new Date()
  }
}
