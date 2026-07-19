export interface RescheduleReqBody {
  booking_id: string
  start_time: string
  end_time: string
}

export interface CreateRescheduleRequestReqBody {
  booking_id: string
  start_time: string
  end_time: string
}

export interface CancelRescheduleRequestReqBody {
  request_id: string
}

export interface RejectRescheduleRequestReqBody {
  reason: string
}
