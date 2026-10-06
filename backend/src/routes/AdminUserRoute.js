import express from "express";

import {
  getAdminUsers,
  updateUserRole,
  getUserStats,
} from "../controllers/AdminUserController.js";

const router = express.Router();

router.get("/stats", getUserStats);

router.get("/", getAdminUsers);

router.patch("/:id/role", updateUserRole);

export default router;