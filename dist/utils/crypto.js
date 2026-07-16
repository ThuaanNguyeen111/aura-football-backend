"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
const crypto_1 = require("crypto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
function sha256(data) {
    return (0, crypto_1.createHash)('sha256').update(data).digest('hex');
}
function hashPassword(password) {
    const secret = process.env.PASSWORD_SECRET;
    if (!secret) {
        throw new Error('PASSWORD_SECRET is not defined in .env');
    }
    return sha256(password + secret);
}
