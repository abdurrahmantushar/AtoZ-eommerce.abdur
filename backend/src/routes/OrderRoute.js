import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderByTrackingCode,
} from "../controllers/OrderController.js";

const router = express.Router();

router.post("/", createOrder);

router.get("/", getMyOrders);

router.get("/track/:trackingCode", getOrderByTrackingCode);

router.get("/:id", getOrderById);

router.patch("/:id/cancel", cancelOrder);

export default router;