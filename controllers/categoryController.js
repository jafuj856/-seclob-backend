const Category = require("../models/Category");

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) {
      const err = new Error("Category already exists");
      err.status = 400;
      throw err;
    }
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};
