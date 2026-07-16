"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    UNPROCESSABLE_ENTITY: 422,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    PARTIAL_CONTENT: 206,
    TOO_MANY_REQUESTS: 429,
    CONFLICT: 409
};
exports.default = HTTP_STATUS;
