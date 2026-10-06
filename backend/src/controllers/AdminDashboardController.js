import { fromNodeHeaders } from "better-auth/node";

import { auth, db } from "../lib/auth.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const getDashboard = async (req, res) => {
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

    const userCollection = db.collection("user");

    const [
      revenueResult,
      totalOrders,
      totalCustomers,
      totalProducts,
      processingOrders,
      lowStockItems,
      recentOrders,
      topProducts,
    ] = await Promise.all([
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

      Order.countDocuments(),

      userCollection.countDocuments({
        role: "user",
      }),

      Product.countDocuments(),

      Order.countDocuments({
        orderStatus: "processing",
      }),

      Product.countDocuments({
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      Order.find()
        .sort({
          createdAt: -1,
        })
        .limit(4)
        .select(
          "orderNumber shippingAddress orderStatus total createdAt"
        )
        .lean(),

      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.product",
            name: {
              $first: "$items.name",
            },
            sold: {
              $sum: "$items.quantity",
            },
            revenue: {
              $sum: {
                $multiply: [
                  "$items.price",
                  "$items.quantity",
                ],
              },
            },
          },
        },
        {
          $sort: {
            sold: -1,
            revenue: -1,
          },
        },
        {
          $limit: 4,
        },
      ]),
    ]);

    const topProductIds = topProducts
      .map((product) => product._id)
      .filter(Boolean);

    const products = await Product.find({
      _id: {
        $in: topProductIds,
      },
    })
      .select("_id category")
      .populate("category", "name")
      .lean();

    const productMap = new Map(
      products.map((product) => [
        String(product._id),
        product,
      ])
    );

    const formattedRecentOrders = recentOrders.map(
      (order) => ({
        id: order.orderNumber,
        customer:
          order.shippingAddress?.fullName ||
          "Unknown customer",
        status:
          order.orderStatus
            ?.charAt(0)
            .toUpperCase() +
          order.orderStatus?.slice(1),
        total: Number(order.total || 0),
        createdAt: order.createdAt,
      })
    );

    const formattedTopProducts = topProducts.map(
      (product) => {
        const productInfo = productMap.get(
          String(product._id)
        );

        return {
          name: product.name,
          category:
            productInfo?.category?.name ||
            "Uncategorized",
          sold: product.sold,
          revenue: Number(product.revenue || 0),
        };
      }
    );

    const totalRevenue =
      revenueResult[0]?.totalRevenue || 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          totalCustomers,
          totalProducts,
        },

        recentOrders:
          formattedRecentOrders,

        storeHealth: {
          ordersProcessing: processingOrders,
          lowStockItems,
          supportRequests: 0,
        },

        topProducts:
          formattedTopProducts,
      },
    });
  } catch (error) {
    console.error(
      "Get admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};