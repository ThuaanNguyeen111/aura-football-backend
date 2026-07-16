"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Field {
    _id;
    name;
    type;
    price_per_hour;
    amenities;
    linked_field_ids;
    opening_time;
    closing_time;
    is_active;
    created_at;
    updated_at;
    constructor(field) {
        this._id = field._id || new mongodb_1.ObjectId();
        this.name = field.name;
        this.type = field.type;
        this.price_per_hour = field.price_per_hour;
        this.amenities = field.amenities || [];
        this.linked_field_ids = field.linked_field_ids || [];
        this.opening_time = field.opening_time || '06:00'; // Mặc định mở lúc 6h sáng
        this.closing_time = field.closing_time || '22:00'; // Mặc định đóng lúc 10h tối
        this.is_active = field.is_active !== undefined ? field.is_active : true;
        this.created_at = field.created_at || new Date();
        this.updated_at = field.updated_at || new Date();
    }
}
exports.default = Field;
