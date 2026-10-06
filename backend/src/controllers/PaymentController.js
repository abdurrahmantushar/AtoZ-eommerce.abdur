import { fromNodeHeaders } from "better-auth/node";

import Order from "../models/Order.js";
import { auth } from "../lib/auth.js";
import Product from "../models/Product.js";
import stripe from "../config/stripe.js";
import { uploadImageCloude } from "../cloudinary/cloudinary.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const createStripePaymentIntent = async (
  req,
  res
) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: session.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentMethod !== "stripe") {
      return res.status(400).json({
        success: false,
        message: "This order is not using Stripe payment.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order is already paid.",
      });
    }

    if (order.stripePaymentIntentId) {
      const existingIntent =
        await stripe.paymentIntents.retrieve(
          order.stripePaymentIntentId
        );

      return res.status(200).json({
        success: true,
        message: "Payment intent already exists.",
        data: {
          clientSecret:
            existingIntent.client_secret,
          paymentIntentId: existingIntent.id,
        },
      });
    }

    const amount = Math.round(order.total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,

      currency:
        process.env.STRIPE_CURRENCY || "usd",

      payment_method_types: ["card"],

      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: session.user.id,
      },
    });

    order.stripePaymentIntentId =
      paymentIntent.id;

    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Stripe payment intent created successfully.",
      data: {
        clientSecret:
          paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  } catch (error) {
    console.error(
      "Stripe payment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const submitManualPayment = async (
  req,
  res
) => {
  try {
    const session = await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: session.user.id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (
      !["bkash", "nagad"].includes(
        order.paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This order is not a manual payment order.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "This order is already paid.",
      });
    }

    const paymentTransactionId =
      req.body.paymentTransactionId?.trim();

    if (!paymentTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Payment transaction ID is required.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment screenshot is required.",
      });
    }

    const existingTransaction =
      await Order.findOne({
        paymentTransactionId,
        _id: {
          $ne: order._id,
        },
      });

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message:
          "This transaction ID has already been submitted.",
      });
    }

    const uploadedScreenshot =
      await uploadImageCloude(req.file);

    order.paymentTransactionId =
      paymentTransactionId;

    order.paymentScreenshot =
      uploadedScreenshot.secure_url;

    order.paymentStatus =
      "pending_verification";

    await order.save();

    res.status(200).json({
      success: true,
      message:
        "Payment submitted for verification.",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        paymentTransactionId:
          order.paymentTransactionId,
        paymentScreenshot:
          order.paymentScreenshot,
        paymentStatus:
          order.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "Manual payment error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyManualPayment = async (req, res) => {
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

    if (!["paid", "failed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const order = await Order.findById(
      req.params.orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (!["bkash", "nagad"].includes(order.paymentMethod)) {
      return res.status(400).json({
        success: false,
        message:
          "Only bKash and Nagad payments can be verified here.",
      });
    }

    if (order.paymentStatus !== "pending_verification") {
      return res.status(400).json({
        success: false,
        message:
          "This payment is not waiting for verification.",
      });
    }

    if (status === "paid") {
      order.paymentStatus = "paid";
      order.orderStatus = "processing";

      await order.save();

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: order,
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
        },
      });
    }

    order.paymentStatus = "failed";
    order.orderStatus = "cancelled";

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment rejected and order cancelled.",
      data: order,
    });
  } catch (error) {
    console.error(
      "Manual payment verification error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const stripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Invalid Stripe webhook signature.",
    });
  }

  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;

      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        return res.status(200).json({
          received: true,
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      if (order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.orderStatus = "processing";

        await order.save();
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;

      const orderId = paymentIntent.metadata?.orderId;

      if (!orderId) {
        return res.status(200).json({
          received: true,
        });
      }

      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found.",
        });
      }

      if (
        order.paymentStatus !== "paid" &&
        order.orderStatus !== "cancelled"
      ) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            {
              $inc: {
                stock: item.quantity,
              },
            }
          );
        }

        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";

        await order.save();
      }
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};