import { fromNodeHeaders } from "better-auth/node";

import { auth, db } from "../lib/auth.js";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

export const getAdminUsers = async (req, res) => {
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
      role,
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const filter = {};

    if (q.trim()) {
      filter.$or = [
        {
          name: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: q.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (role) {
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role.",
        });
      }

      filter.role = role;
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

    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    const collection = db.collection("user");

    const [users, total] = await Promise.all([
      collection
        .find(filter)
        .project({
          _id: 1,
          id: 1,
          name: 1,
          email: 1,
          image: 1,
          emailVerified: 1,
          role: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .sort(sortOption)
        .skip(skip)
        .limit(currentLimit)
        .toArray(),

      collection.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
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
      "Get admin users error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserRole = async (req, res) => {
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

    const { role } = req.body;
    const { id } = req.params;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
      });
    }

    if (session.user.id === id) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot change your own admin role.",
      });
    }

    const collection = db.collection("user");

    const result = await collection.findOneAndUpdate(
      {
        id,
      },
      {
        $set: {
          role,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
      }
    );

    const updatedUser =
      result?.value || result;

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(
      "Update user role error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserStats = async (req, res) => {
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

    const collection = db.collection("user");

    const [
      totalUsers,
      adminUsers,
      normalUsers,
      verifiedUsers,
      unverifiedUsers,
    ] = await Promise.all([
      collection.countDocuments(),

      collection.countDocuments({
        role: "admin",
      }),

      collection.countDocuments({
        role: "user",
      }),

      collection.countDocuments({
        emailVerified: true,
      }),

      collection.countDocuments({
        emailVerified: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          normal: normalUsers,
        },

        verification: {
          verified: verifiedUsers,
          unverified: unverifiedUsers,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get user stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};