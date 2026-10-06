import express from "express";

import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  removeProductFromWishlist,
} from "../controllers/WishlistController.js";

const router = express.Router();

router.post("/:productId", addToWishlist);

router.get("/", getMyWishlist);

router.delete("/:id", removeFromWishlist);

router.delete(
  "/product/:productId",
  removeProductFromWishlist
);

export default router;