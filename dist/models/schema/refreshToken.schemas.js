"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class RefreshToken {
    _id;
    token;
    created_at;
    user_id;
    iat;
    exp;
    constructor({ _id, token, created_at, user_id, iat, exp }) {
        this._id = _id || new mongodb_1.ObjectId();
        this.token = token;
        this.created_at = created_at || new Date();
        this.user_id = user_id;
        this.iat = new Date(iat * 1000); // JWT trả về giây, MongoDB cần mili-giây
        this.exp = new Date(exp * 1000);
    }
}
exports.default = RefreshToken;
