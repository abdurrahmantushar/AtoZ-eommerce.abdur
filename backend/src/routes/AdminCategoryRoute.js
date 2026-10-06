import express from "express";

import {
  getCategoryStats,
} from "../controllers/CategoryController.js";
import requireAdmin from "../lib/requireAdmin.js";


const router = express.Router();

router.get(
  "/stats",
  requireAdmin,
  getCategoryStats
);

export default router;