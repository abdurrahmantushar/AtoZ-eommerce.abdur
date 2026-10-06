import Coupon from "../models/Coupon.js";

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    } = req.body;

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      usageLimit,
      expiresAt,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully.",
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
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
        message: "This coupon has reached its usage limit.",
      });
    }

    const amount = Number(orderAmount);

    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount.",
      });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${coupon.minOrderAmount}.`,
      });
    }

    let discount = 0;

    if (coupon.type === "percentage") {
      discount = (amount * coupon.value) / 100;

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

    if (discount > amount) {
      discount = amount;
    }

    discount = Number(discount.toFixed(2));

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Get active coupons error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active coupons.",
    });
  }
};