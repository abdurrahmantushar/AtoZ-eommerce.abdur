import express from "express";

import {
  createCoupon,
  getCoupons,
  getCouponById,
  getActiveCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/CouponController.js";

import requireAdmin from "../lib/requireAdmin.js";

const router = express.Router();

router.post("/", requireAdmin, createCoupon);

router.get("/", requireAdmin, getCoupons);

router.get("/active", getActiveCoupons);

router.post("/validate", validateCoupon);

router.get("/:id", requireAdmin, getCouponById);

router.put("/:id", requireAdmin, updateCoupon);

router.delete("/:id", requireAdmin, deleteCoupon);

export default router;