import express from "express";

import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/CartController.js";

const router = express.Router();

router.get("/", getMyCart);

router.post("/", addToCart);

router.put("/:productId", updateCartItem);

router.delete("/:productId", removeCartItem);

router.delete("/", clearCart);

export default router;