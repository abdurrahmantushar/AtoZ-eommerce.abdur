import { fromNodeHeaders } from "better-auth/node";

import Product from "../models/Product.js";
import { auth } from "../lib/auth.js";
import Cart from "../models/cart.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const getMyCart = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    let cart = await Cart.findOne({
      userId: session.user.id,
    }).populate(
      "items.product",
      "name slug price comparePrice images stock isActive"
    );

    if (!cart) {
      cart = await Cart.create({
        userId: session.user.id,
        items: [],
      });
    }

    const validItems = cart.items.filter(
      (item) => item.product && item.product.isActive
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      productId,
      quantity = 1,
      selectedColor = "",
      selectedSize = "",
    } = req.body;

    const product = await Product.findOne({
      _id: productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const parsedQuantity = Number(quantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity.",
      });
    }

    if (product.stock < parsedQuantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available.",
      });
    }

    let cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() ===
          productId.toString() &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + parsedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock.",
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity: parsedQuantity,
        selectedColor,
        selectedSize,
      });
    }

    await cart.save();

    await cart.populate(
      "items.product",
      "name slug price comparePrice images stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Product added to cart.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      quantity,
      selectedColor,
      selectedSize,
    } = req.body;

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const item = cart.items.find(
      (cartItem) =>
        cartItem.product.toString() ===
        req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    const product = await Product.findOne({
      _id: req.params.productId,
      isActive: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (quantity !== undefined) {
      const parsedQuantity = Number(quantity);

      if (
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid quantity.",
        });
      }

      if (parsedQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock.",
        });
      }

      item.quantity = parsedQuantity;
    }

    if (selectedColor !== undefined) {
      item.selectedColor = selectedColor;
    }

    if (selectedSize !== undefined) {
      item.selectedSize = selectedSize;
    }

    await cart.save();

    await cart.populate(
      "items.product",
      "name slug price comparePrice images stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    const initialLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !==
        req.params.productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
    }

    await cart.save();

    await cart.populate(
      "items.product",
      "name slug price comparePrice images stock isActive"
    );

    res.status(200).json({
      success: true,
      message: "Product removed from cart.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const clearCart = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const cart = await Cart.findOne({
      userId: session.user.id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is already empty.",
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};