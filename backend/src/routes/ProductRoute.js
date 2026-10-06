import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";

import upload from "../middleware/upload.js";
import requireAdmin from "../lib/requireAdmin.js";

const router = express.Router();

router.post(
  "/",
  requireAdmin,
  upload.array("images", 8),
  createProduct
);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put(
  "/:id",
  requireAdmin,
  upload.array("images", 8),
  updateProduct
);

router.delete(
  "/:id",
  requireAdmin,
  deleteProduct
);

export default router;