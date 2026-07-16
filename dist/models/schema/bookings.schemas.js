"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const enums_1 = require("../../constants/enums");
class Booking {
    _id;
    user_id;
    field_id;
    locked_field_ids;
    start_time;
    end_time;
    base_price;
    discount_amount;
    final_price;
    status;
    payment_method; // 🔥 Bổ sung thêm dòng này
    payment_link_id;
    created_at;
    updated_at;
    constructor(booking) {
        const now = new Date();
        this._id = booking._id || new mongodb_1.ObjectId();
        this.user_id = booking.user_id;
        this.field_id = booking.field_id;
        this.locked_field_ids = booking.locked_field_ids;
        this.start_time = booking.start_time;
        this.end_time = booking.end_time;
        this.base_price = booking.base_price;
        this.discount_amount = booking.discount_amount || 0;
        this.final_price = booking.final_price;
        this.status = booking.status !== undefined ? booking.status : enums_1.BookingStatus.Pending;
        this.payment_method = booking.payment_method;
        this.payment_link_id = booking.payment_link_id || '';
        this.created_at = booking.created_at || now;
        this.updated_at = booking.updated_at || now;
    }
}
exports.default = Booking;
