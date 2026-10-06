import express from "express";

import {
  createStripePaymentIntent,
  submitManualPayment,
  verifyManualPayment,
} from "../controllers/PaymentController.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/orders/:orderId/stripe-intent",
  createStripePaymentIntent
);

router.post(
  "/orders/:orderId/manual",
  upload.single("paymentScreenshot"),
  submitManualPayment
);

router.patch(
  "/orders/:orderId/verify-manual",
  verifyManualPayment
);

export default router;