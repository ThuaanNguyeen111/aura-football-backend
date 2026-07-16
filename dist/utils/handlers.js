"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarpAsync = void 0;
const WarpAsync = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch (error) {
            next(error);
        }
    };
};
exports.WarpAsync = WarpAsync;
