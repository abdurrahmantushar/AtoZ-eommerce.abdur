import express from "express";

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/CategoryController.js";
import requireAdmin from "../lib/requireAdmin.js";


const router = express.Router();

router.post("/", requireAdmin, createCategory);

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.put("/:id", requireAdmin, updateCategory);

router.delete("/:id", requireAdmin, deleteCategory);

export default router;