"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewController = void 0;
const reviews_services_1 = __importDefault(require("../services/reviews.services"));
const createReviewController = async (req, res) => {
    const { user_id } = req.decode_authorization;
    const result = await reviews_services_1.default.createReview(user_id, req.body);
    res.json(result);
};
exports.createReviewController = createReviewController;
