import express from "express";

import {
  getAllOrders,
  updateOrderStatus,
  getOrderStats
} from "../controllers/OrderController.js";



const router = express.Router();

router.get("/", getAllOrders);

router.get("/stats", getOrderStats);

router.patch("/:id/status", updateOrderStatus);

export default router;