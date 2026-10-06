import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      image,
      isActive,
    } = req.body;

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryStats = async (req, res) => {
  try {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      categoryProductStats,
    ] = await Promise.all([
      Category.countDocuments(),

      Category.countDocuments({
        isActive: true,
      }),

      Category.countDocuments({
        isActive: false,
      }),

      Category.aggregate([
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "category",
            as: "products",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            slug: 1,
            isActive: 1,
            productCount: {
              $size: "$products",
            },
          },
        },
        {
          $sort: {
            productCount: -1,
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: {
          total: totalCategories,
          active: activeCategories,
          inactive: inactiveCategories,
        },

        categoryProductStats,
      },
    });
  } catch (error) {
    console.error(
      "Get category stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};