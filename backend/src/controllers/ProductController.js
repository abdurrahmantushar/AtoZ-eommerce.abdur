import {
  uploadImageCloude,
  deleteImageCloude,
} from "../cloudinary/cloudinary.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { auth } from "../lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";

const getUserSession = async (req) => {
  return await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
};

const parseBoolean = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
};

export const createProduct = async (req, res) => {
  try {
    const imageFiles = req.files || [];
    const imageUrls = [];

    for (const file of imageFiles) {
      const uploadedImage = await uploadImageCloude(file);
      imageUrls.push(uploadedImage.secure_url);
    }

    const product = await Product.create({
      name: req.body.name,
      slug: req.body.slug,
      description: req.body.description,
      price: Number(req.body.price),
      comparePrice: Number(req.body.comparePrice || 0),
      images: imageUrls,
      category: req.body.category,
      stock: Number(req.body.stock || 0),
      sku: req.body.sku,
      isActive: parseBoolean(
        req.body.isActive,
        true
      ),
      isFeatured: parseBoolean(
        req.body.isFeatured,
        false
      ),
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "Create product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {
      isActive: true,
    };

    if (q) {
      filter.$or = [
        {
          name: {
            $regex: q,
            $options: "i",
          },
        },
        {
          description: {
            $regex: q,
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      const categoryData = await Category.findOne({
        slug: category,
        isActive: true,
      }).select("_id");

      if (!categoryData) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
          },
        });
      }

      filter.category = categoryData._id;
    }

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
        reviewCount: -1,
      };
    }

    if (sort === "featured") {
      sortOption = {
        isFeatured: -1,
        createdAt: -1,
      };
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

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(currentLimit),

        Product.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      data: products,
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
      "Get products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      ).populate(
        "category",
        "name slug"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(
      "Get product by id error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateProduct = async (
  req,
  res
) => {
  try {
    const existingProduct =
      await Product.findById(
        req.params.id
      );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const imageFiles = req.files || [];

    const updateData = {
      ...req.body,
    };

    if (req.body.price !== undefined) {
      updateData.price = Number(
        req.body.price
      );
    }

    if (
      req.body.comparePrice !==
      undefined
    ) {
      updateData.comparePrice =
        Number(req.body.comparePrice);
    }

    if (req.body.stock !== undefined) {
      updateData.stock = Number(
        req.body.stock
      );
    }

    if (
      req.body.isActive !== undefined
    ) {
      updateData.isActive =
        parseBoolean(
          req.body.isActive,
          true
        );
    }

    if (
      req.body.isFeatured !== undefined
    ) {
      updateData.isFeatured =
        parseBoolean(
          req.body.isFeatured,
          false
        );
    }

    if (imageFiles.length > 0) {
      const newImageUrls = [];

      for (const file of imageFiles) {
        const uploadedImage =
          await uploadImageCloude(file);

        newImageUrls.push(
          uploadedImage.secure_url
        );
      }

      updateData.images =
        newImageUrls;
    }

    const updatedProduct =
      await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name slug"
      );

    if (imageFiles.length > 0) {
      for (const oldImage of
        existingProduct.images) {
        await deleteImageCloude(
          oldImage
        );
      }
    }

    res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    for (const imageUrl of
      product.images) {
      await deleteImageCloude(
        imageUrl
      );
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAdminProducts = async (
  req,
  res
) => {
  try {
    const session =
      await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (
      session.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required.",
      });
    }

const {
  q = "",
  category,
  isActive,
  isFeatured,
  minPrice,
  maxPrice,
  page = 1,
  limit = 12,
  sort = "newest",
} = req.query;

const filter = {};

console.log("ADMIN FILTER:", filter);
    
console.log(
  "ADMIN PRODUCT COUNT:",
  await Product.countDocuments({})
);
    if (q.trim()) {
      filter.$or = [
        {
          name: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          slug: {
            $regex: q.trim(),
            $options: "i",
          },
        },
        {
          sku: {
            $regex: q.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category) {
      const categoryData =
        await Category.findOne({
          slug: category,
        }).select("_id");

      if (!categoryData) {
        return res.status(200).json({
          success: true,
          data: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0,
          },
        });
      }

      filter.category =
        categoryData._id;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    if (isFeatured !== undefined) {
      filter.isFeatured =
        isFeatured === "true";
    }

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte =
          Number(maxPrice);
      }
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
      (currentPage - 1) *
      currentLimit;

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "stock-low") {
      sortOption = {
        stock: 1,
      };
    }

    if (sort === "stock-high") {
      sortOption = {
        stock: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
        reviewCount: -1,
      };
    }

    const [products, total] =
      await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug"
          )
          .sort(sortOption)
          .skip(skip)
          .limit(currentLimit),

        Product.countDocuments(filter),
      ]);

    res.status(200).json({
      success: true,
      data: products,
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
      "Get admin products error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductStats = async (
  req,
  res
) => {
  try {
    const session =
      await getUserSession(req);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (
      session.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required.",
      });
    }

    const [
      totalProducts,
      activeProducts,
      inactiveProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      inventoryResult,
    ] = await Promise.all([
      Product.countDocuments(),

      Product.countDocuments({
        isActive: true,
      }),

      Product.countDocuments({
        isActive: false,
      }),

      Product.countDocuments({
        isFeatured: true,
      }),

      Product.countDocuments({
        stock: {
          $gt: 0,
          $lte: 5,
        },
      }),

      Product.countDocuments({
        stock: 0,
      }),

      Product.aggregate([
        {
          $match: {
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            totalStock: {
              $sum: "$stock",
            },
            inventoryValue: {
              $sum: {
                $multiply: [
                  "$price",
                  "$stock",
                ],
              },
            },
          },
        },
      ]),
    ]);

    const inventory =
      inventoryResult[0] || {
        totalStock: 0,
        inventoryValue: 0,
      };

    res.status(200).json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
          featured: featuredProducts,
        },
        inventory: {
          totalStock:
            inventory.totalStock,
          lowStock:
            lowStockProducts,
          outOfStock:
            outOfStockProducts,
          inventoryValue: Number(
            inventory.inventoryValue.toFixed(
              2
            )
          ),
        },
      },
    });
  } catch (error) {
    console.error(
      "Get product stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};