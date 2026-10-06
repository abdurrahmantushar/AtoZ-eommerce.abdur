import express from "express";

import {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview,
  updateReviewStatus,
} from "../controllers/ReviewController.js";

import requireAdmin from "../lib/requireAdmin.js";

const router = express.Router();

router.get(
  "/",
  requireAdmin,
  getAllReviews
);

router.post(
  "/product/:productId",
  createReview
);

router.get(
  "/product/:productId",
  getProductReviews
);

router.delete(
  "/:id",
  deleteReview
);

router.patch(
  "/:id/status",
  requireAdmin,
  updateReviewStatus
);

export default router;