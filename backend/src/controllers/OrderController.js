import crypto from "crypto";
import { fromNodeHeaders } from "better-auth/node";

import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/cart.js";

import { auth } from "../lib/auth.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

const createOrderNumber = () => {
  return `AZ-${Date.now()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};


export const createOrder = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const {
      items: requestItems,
      addressId,
      shippingMethod = "standard",
      paymentMethod = "cod",
      couponCode = "",
    } = req.body;

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required.",
      });
    }

    if (!["standard", "express"].includes(shippingMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipping method.",
      });
    }

    if (
      !["cod", "stripe", "bkash", "nagad"].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const address = await Address.findOne({
      _id: addressId,
      userId: session.user.id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Shipping address not found.",
      });
    }

    let items = requestItems;

    if (!Array.isArray(items) || items.length === 0) {
      const cart = await Cart.findOne({
        userId: session.user.id,
      });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty.",
        });
      }

      items = cart.items.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
      }));
    }

    const quantityMap = new Map();

    for (const item of items) {
      const productId = item.productId?.toString();
      const quantity = Number(item.quantity);

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required.",
        });
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity.",
        });
      }

      const previousQuantity =
        quantityMap.get(productId) || 0;

      quantityMap.set(
        productId,
        previousQuantity + quantity
      );
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        isActive: true,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      const totalRequestedQuantity =
        quantityMap.get(product._id.toString());

      if (
        product.stock < totalRequestedQuantity
      ) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock.`,
        });
      }

      const quantity = Number(item.quantity);

      subtotal += product.price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
      });
    }

    const shippingCost =
      shippingMethod === "express" ? 12 : 0;

    let discount = 0;
    let couponId = null;
    let savedCouponCode = "";

    if (couponCode.trim()) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      });

      if (!coupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid coupon code.",
        });
      }

      if (
        coupon.expiresAt &&
        new Date(coupon.expiresAt) < new Date()
      ) {
        return res.status(400).json({
          success: false,
          message: "This coupon has expired.",
        });
      }

      if (
        coupon.usageLimit > 0 &&
        coupon.usedCount >= coupon.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This coupon has reached its usage limit.",
        });
      }

      if (
        subtotal < coupon.minOrderAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Minimum order amount is ${coupon.minOrderAmount}.`,
        });
      }

      if (coupon.type === "percentage") {
        discount =
          (subtotal * coupon.value) / 100;

        if (
          coupon.maxDiscount > 0 &&
          discount > coupon.maxDiscount
        ) {
          discount = coupon.maxDiscount;
        }
      }

      if (coupon.type === "fixed") {
        discount = coupon.value;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      discount = Number(
        discount.toFixed(2)
      );

      couponId = coupon._id;
      savedCouponCode = coupon.code;
    }

    const total = Number(
      (
        subtotal +
        shippingCost -
        discount
      ).toFixed(2)
    );

    const updatedProducts = [];

    for (const [productId, quantity] of quantityMap) {
      const updatedProduct =
        await Product.findOneAndUpdate(
          {
            _id: productId,
            isActive: true,
            stock: {
              $gte: quantity,
            },
          },
          {
            $inc: {
              stock: -quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        for (const updatedItem of updatedProducts) {
          await Product.findByIdAndUpdate(
            updatedItem.productId,
            {
              $inc: {
                stock: updatedItem.quantity,
              },
            }
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Stock changed while placing the order. Please try again.",
        });
      }

      updatedProducts.push({
        productId,
        quantity,
      });
    }

    try {
      const order = await Order.create({
        orderNumber: createOrderNumber(),

        userId: session.user.id,

        items: orderItems,

        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine: address.addressLine,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country,
        },

        subtotal,
        shippingCost,
        discount,

        couponId,
        couponCode: savedCouponCode,

        total,

        paymentMethod,
        paymentStatus: "pending",
        paymentTransactionId: "",
        paymentScreenshot: "",
        orderStatus: "pending",
        stripePaymentIntentId: "",
      });

      if (couponId) {
        await Coupon.findByIdAndUpdate(
          couponId,
          {
            $inc: {
              usedCount: 1,
            },
          }
        );
      }

      await Cart.findOneAndUpdate(
        {
          userId: session.user.id,
        },
        {
          $set: {
            items: [],
          },
        }
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully.",
        data: order,
      });
    } catch (error) {
      for (const updatedItem of updatedProducts) {
        await Product.findByIdAndUpdate(
          updatedItem.productId,
          {
            $inc: {
              stock: updatedItem.quantity,
            },
          }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const orders = await Order.find({
      userId: session.user.id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: session.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      !["pending", "processing"].includes(
        order.orderStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "This order cannot be cancelled.",
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    order.orderStatus = "cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const {
      q = "",
      orderStatus,
      paymentStatus,
      paymentMethod,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const filter = {};

    if (q.trim()) {
      filter.$or = [
        {
          orderNumber: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          userId: {
            $regex: q.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const currentPage = Math.max(
      Number(page),
      1
    );

    const currentLimit = Math.min(
      Math.max(Number(limit), 1),
      50
    );

    const skip =
      (currentPage - 1) * currentLimit;

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "total-low") {
      sortOption = {
        total: 1,
      };
    }

    if (sort === "total-high") {
      sortOption = {
        total: -1,
      };
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(currentLimit),

      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(
          total / currentLimit
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get all orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(
      req.params.id
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    order.orderStatus = status;

    if (status === "delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
    }

    await order.save();

    console.log("Updated Order:", {
  orderStatus: order.orderStatus,
  paymentMethod: order.paymentMethod,
  paymentStatus: order.paymentStatus,
});

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      data: order,
    });
  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingPayments,
      pendingVerificationPayments,
      paidPayments,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "pending",
      }),

      Order.countDocuments({
        orderStatus: "processing",
      }),

      Order.countDocuments({
        orderStatus: "shipped",
      }),

      Order.countDocuments({
        orderStatus: "delivered",
      }),

      Order.countDocuments({
        orderStatus: "cancelled",
      }),

      Order.countDocuments({
        paymentStatus: "pending",
      }),

      Order.countDocuments({
        paymentStatus: "pending_verification",
      }),

      Order.countDocuments({
        paymentStatus: "paid",
      }),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$total",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        payments: {
          pending: pendingPayments,
          pendingVerification:
            pendingVerificationPayments,
          paid: paidPayments,
        },

        revenue: Number(
          totalRevenue.toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error(
      "Get order stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderByTrackingCode = async (req, res) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const trackingCode = req.params.trackingCode?.trim();

    if (!trackingCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking code is required.",
      });
    }

    const order = await Order.findOne({
      orderNumber: trackingCode,
      userId: session.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Get order by tracking code error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};