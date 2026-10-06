import express from "express";

import {
  getAdminProducts,
  getProductStats,
} from "../controllers/ProductController.js";

import requireAdmin from "../lib/requireAdmin.js";

const router = express.Router();

router.get("/", requireAdmin, getAdminProducts);

router.get("/stats", requireAdmin, getProductStats);

export default router;