const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

exports.createSubCategory = async (req, res, next) => {
  try {
    const { name, category } = req.body;
    const exists = await SubCategory.findOne({ name, category });
    if (exists) {
      const err = new Error("Subcategory already exists under this category");
      err.status = 400;
      throw err;
    }
    const subCategory = await SubCategory.create({ name, category });
    res.status(201).json(subCategory);
  } catch (err) {
    next(err);
  }
};

exports.getSubCategories = async (req, res, next) => {
  try {
    const subCategories = await SubCategory.find().populate("category");
    res.json(subCategories);
  } catch (err) {
    next(err);
  }
};

exports.getCategoriesWithSubs = async (req, res, next) => {
  try {
    const categories = await Category.find();
    const subCategories = await SubCategory.find().populate("category");

    const merged = categories.map((cat) => {
      const sub = subCategories
        .filter((s) => s.category._id.toString() === cat._id.toString())
        .map((s) => ({ id: s._id, name: s.name }));
      return {
        id: cat._id,
        category: cat.name,
        sub,
      };
    });

    res.json(merged);
  } catch (err) {
    next(err);
  }
};
