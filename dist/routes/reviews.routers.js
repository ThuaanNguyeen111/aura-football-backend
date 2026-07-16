"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const handlers_1 = require("../utils/handlers");
const users_middlewares_1 = require("../middlewares/users.middlewares");
const reviews_middlewares_1 = require("../middlewares/reviews.middlewares");
const reviews_controllers_1 = require("../controllers/reviews.controllers");
const reviewsRouter = (0, express_1.Router)();
// [POST] /reviews - Khách hàng đánh giá chất lượng sân
reviewsRouter.post('/', users_middlewares_1.accessTokenValidator, reviews_middlewares_1.createReviewValidator, (0, handlers_1.WarpAsync)(reviews_controllers_1.createReviewController));
exports.default = reviewsRouter;
