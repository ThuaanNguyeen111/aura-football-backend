import { ObjectId } from 'mongodb'

interface ReviewType {
  _id?: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  booking_id: ObjectId
  rating: number
  comment: string
  created_at?: Date
  updated_at?: Date
  admin_reply?: string
  is_hidden?: boolean
}

export default class Review {
  _id: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  booking_id: ObjectId
  rating: number
  comment: string
  created_at: Date
  updated_at: Date
  admin_reply: string
  is_hidden: boolean

  constructor(review: ReviewType) {
    this._id = review._id || new ObjectId()
    this.user_id = review.user_id
    this.field_id = review.field_id
    this.booking_id = review.booking_id
    this.rating = review.rating
    this.comment = review.comment
    this.created_at = review.created_at || new Date()
    this.updated_at = review.updated_at || new Date()
    this.admin_reply = review.admin_reply || ''
    this.is_hidden = review.is_hidden || false
  }
}
