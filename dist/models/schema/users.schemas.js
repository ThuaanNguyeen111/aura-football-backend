"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const enums_1 = require("../../constants/enums");
class User {
    _id;
    name;
    email;
    password;
    phone_number;
    wallet_balance;
    has_booked_before;
    created_at;
    updated_at;
    email_verify_token;
    forgot_password_token;
    verify;
    role;
    constructor(user) {
        const now = new Date();
        this._id = user._id || new mongodb_1.ObjectId();
        this.name = user.name;
        this.email = user.email;
        this.password = user.password;
        this.phone_number = user.phone_number || '';
        this.wallet_balance = user.wallet_balance || 0;
        this.has_booked_before = user.has_booked_before || false;
        this.created_at = user.created_at || now;
        this.updated_at = user.updated_at || now;
        this.email_verify_token = user.email_verify_token || '';
        this.forgot_password_token = user.forgot_password_token || '';
        this.verify = user.verify || enums_1.UserVerifyStatus.Unverified;
        this.role = user.role || enums_1.UserRole.User;
    }
}
exports.default = User;
