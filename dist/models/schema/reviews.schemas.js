"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Review {
    _id;
    user_id;
    field_id;
    booking_id;
    rating;
    comment;
    created_at;
    updated_at;
    constructor(review) {
        this._id = review._id || new mongodb_1.ObjectId();
        this.user_id = review.user_id;
        this.field_id = review.field_id;
        this.booking_id = review.booking_id;
        this.rating = review.rating;
        this.comment = review.comment;
        this.created_at = review.created_at || new Date();
        this.updated_at = review.updated_at || new Date();
    }
}
exports.default = Review;
