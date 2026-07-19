import { ObjectId } from 'mongodb'
import { RescheduleStatus } from '~/constants/enums'

interface RescheduleRequestType {
  _id?: ObjectId
  booking_id: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  old_start_time: Date
  old_end_time: Date
  new_start_time: Date
  new_end_time: Date
  status?: RescheduleStatus
  reject_reason?: string
  reviewed_by?: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class RescheduleRequest {
  _id: ObjectId
  booking_id: ObjectId
  user_id: ObjectId
  field_id: ObjectId
  old_start_time: Date
  old_end_time: Date
  new_start_time: Date
  new_end_time: Date
  status: RescheduleStatus
  reject_reason: string
  reviewed_by?: ObjectId
  created_at: Date
  updated_at: Date

  constructor(request: RescheduleRequestType) {
    const now = new Date()
    this._id = request._id || new ObjectId()
    this.booking_id = request.booking_id
    this.user_id = request.user_id
    this.field_id = request.field_id
    this.old_start_time = request.old_start_time
    this.old_end_time = request.old_end_time
    this.new_start_time = request.new_start_time
    this.new_end_time = request.new_end_time
    this.status = request.status !== undefined ? request.status : RescheduleStatus.Pending
    this.reject_reason = request.reject_reason || ''
    this.reviewed_by = request.reviewed_by
    this.created_at = request.created_at || now
    this.updated_at = request.updated_at || now
  }
}
