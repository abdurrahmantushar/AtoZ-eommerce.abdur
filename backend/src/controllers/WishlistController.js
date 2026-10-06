import { fromNodeHeaders } from "better-auth/node";

import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { auth } from "../lib/auth.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const addToWishlist = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const { productId } = req.params;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const existingItem = await Wishlist.findOne({
      userId: session.user.id,
      product: productId,
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: "Product is already in wishlist.",
      });
    }

    const wishlist = await Wishlist.create({
      userId: session.user.id,
      product: productId,
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist.",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyWishlist = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const wishlist = await Wishlist.find({
      userId: session.user.id,
    })
      .populate("product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const wishlist = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const wishlist = await Wishlist.findOneAndDelete({
      userId: session.user.id,
      product: req.params.productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};