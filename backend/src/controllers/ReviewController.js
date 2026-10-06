import { fromNodeHeaders } from "better-auth/node";

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { auth } from "../lib/auth.js";

const getUserSession = async (req) => {
return auth.api.getSession({
headers: fromNodeHeaders(req.headers),
});
};

export const createReview = async (req, res) => {
try {
const session = await getUserSession(req);

if (!session) {
  return res.status(401).json({
    success: false,
    message: "Please login first.",
  });
}

const { productId } = req.params;
const { rating, title, comment } = req.body;

const product = await Product.findById(productId);

if (!product) {
  return res.status(404).json({
    success: false,
    message: "Product not found.",
  });
}

if (
  !Number.isInteger(Number(rating)) ||
  Number(rating) < 1 ||
  Number(rating) > 5
) {
  return res.status(400).json({
    success: false,
    message: "Rating must be between 1 and 5.",
  });
}

if (!comment?.trim()) {
  return res.status(400).json({
    success: false,
    message: "Review comment is required.",
  });
}

const existingReview = await Review.findOne({
  product: productId,
  userId: session.user.id,
});

if (existingReview) {
  return res.status(409).json({
    success: false,
    message: "You have already reviewed this product.",
  });
}

const deliveredOrder = await Order.findOne({
  userId: session.user.id,
  orderStatus: "delivered",
  "items.product": productId,
});

if (!deliveredOrder) {
  return res.status(403).json({
    success: false,
    message:
      "You can review this product after it has been delivered to you.",
  });
}

const review = await Review.create({
  product: productId,
  userId: session.user.id,
  userName: session.user.name || "User",
  rating: Number(rating),
  title: title?.trim() || "",
  comment: comment.trim(),
  status: "pending",
  isVerifiedPurchase: true,
});

res.status(201).json({
  success: true,
  message:
    "Review submitted successfully and is waiting for approval.",
  data: review,
});

} catch (error) {
console.error("Create review error:", error);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};

export const getProductReviews = async (req, res) => {
try {
const reviews = await Review.find({
product: req.params.productId,
status: "approved",
})
.sort({ createdAt: -1 })
.select(
"userId userName rating title comment isVerifiedPurchase createdAt"
);

res.status(200).json({
  success: true,
  data: reviews,
});

} catch (error) {
console.error("Get product reviews error:", error);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};

export const getAllReviews = async (req, res) => {
try {
const reviews = await Review.find()
.sort({ createdAt: -1 })
.lean();

const productIds = [
  ...new Set(
    reviews
      .map((review) => review.product?.toString())
      .filter(Boolean)
  ),
];

const products =
  productIds.length > 0
    ? await Product.find({
        _id: { $in: productIds },
      })
        .select("_id name")
        .lean()
    : [];

const productMap = new Map(
  products.map((product) => [
    product._id.toString(),
    product,
  ])
);

const populatedReviews = reviews.map((review) => {
  const product = productMap.get(
    review.product?.toString()
  );

  return {
    ...review,
    product: product
      ? {
          _id: product._id,
          name: product.name,
        }
      : review.product,
  };
});

res.status(200).json({
  success: true,
  data: populatedReviews,
});

} catch (error) {
console.error("Get all reviews error:", error);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};

export const deleteReview = async (req, res) => {
try {
const session = await getUserSession(req);

if (!session) {
  return res.status(401).json({
    success: false,
    message: "Please login first.",
  });
}

const review = await Review.findById(req.params.id);

if (!review) {
  return res.status(404).json({
    success: false,
    message: "Review not found.",
  });
}

const isAdmin =
  session.user.role === "admin";

const isOwner =
  review.userId === session.user.id;

if (!isAdmin && !isOwner) {
  return res.status(403).json({
    success: false,
    message: "You cannot delete this review.",
  });
}

await Review.findByIdAndDelete(req.params.id);

res.status(200).json({
  success: true,
  message: isAdmin
    ? "Review deleted by admin successfully."
    : "Review deleted successfully.",
});

} catch (error) {
console.error("Delete review error:", error);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};

export const updateReviewStatus = async (req, res) => {
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

if (!["approved", "rejected"].includes(status)) {
  return res.status(400).json({
    success: false,
    message: "Invalid review status.",
  });
}

const review = await Review.findById(
  req.params.id
);

if (!review) {
  return res.status(404).json({
    success: false,
    message: "Review not found.",
  });
}

if (review.status === status) {
  return res.status(400).json({
    success: false,
    message: `Review is already ${status}.`,
  });
}

review.status = status;

await review.save();

const productReviews = await Review.find({
  product: review.product,
  status: "approved",
}).select("rating");

const reviewCount = productReviews.length;

const totalRating = productReviews.reduce(
  (sum, item) => sum + item.rating,
  0
);

const rating =
  reviewCount > 0
    ? Number(
        (totalRating / reviewCount).toFixed(1)
      )
    : 0;

await Product.findByIdAndUpdate(
  review.product,
  {
    rating,
    reviewCount,
  }
);

res.status(200).json({
  success: true,
  message: `Review ${status} successfully.`,
  data: {
    review,
    productRating: rating,
    reviewCount,
  },
});

} catch (error) {
console.error(
"Update review status error:",
error
);

res.status(500).json({
  success: false,
  message: error.message,
});

}
};
