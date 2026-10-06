import express from "express";

import {
  getDashboard,
} from "../controllers/AdminDashboardController.js";

const router = express.Router();

router.get("/", getDashboard);

export default router;