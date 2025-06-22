const Product = require("../models/Product");
const User = require("../models/User");

exports.createProduct = async (req, res, next) => {
  try {
    const { title, description, subCategory, variants, images } = req.body;

    const createdProducts = [];

    for (const variant of variants) {
      const variantTitle = `${title} - ${variant.ram}`;
      const exists = await Product.findOne({ title: variantTitle });
      if (exists) continue;

      const product = await Product.create({
        title: variantTitle,
        description,
        subCategory,
        variants: [variant],
        images,
      });

      createdProducts.push(product);
    }

    if (createdProducts.length === 0) {
      const err = new Error("All variants already exist");
      err.status = 400;
      throw err;
    }

    res.status(201).json({
      message: "Products created successfully",
      products: createdProducts,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { search = "", subCategory, limit = 12, page = 1 } = req.query;
    const userId = req.user?.id;
    const filter = {};

    if (search) filter.title = { $regex: search, $options: "i" };

    if (subCategory) {
      const ids = Array.isArray(subCategory)
        ? subCategory
        : subCategory.split(",");
      filter.subCategory = { $in: ids };
    }

    const products = await Product.find(filter)
      .populate("subCategory")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    let favorites = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user) favorites = user.favorites.map((id) => id.toString());
    }

    const productsWithFavorite = products.map((product) => ({
      ...product.toObject(),
      isFavorite: favorites.includes(product._id.toString()),
    }));

    res.json({
      products: productsWithFavorite,
      total,
      totalPages,
      currentPage: Number(page),
    });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "subCategory"
    );
    if (!product) throw new Error("Product not found");

    let isFavorite = false;

    if (req.user?.id) {
      const user = await User.findById(req.user.id);
      if (user?.favorites.includes(product._id.toString())) {
        isFavorite = true;
      }
    }

    res.json({ ...product.toObject(), isFavorite });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product) throw new Error("Product not found");
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id; // ✅ comes from JWT middleware
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const index = user.favorites.indexOf(productId);
    if (index === -1) {
      user.favorites.push(productId);
    } else {
      user.favorites.splice(index, 1);
    }

    await user.save();
    res.json({ message: "Favorites updated", favorites: user.favorites });
  } catch (err) {
    next(err);
  }
};

exports.getFavoriteProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({
      path: "favorites",
      populate: { path: "subCategory" },
    });

    if (!user) throw new Error("User not found");

    const products = user.favorites.map((product) => ({
      ...product.toObject(),
      isFavorite: true,
    }));

    res.json({ favorites: products });
  } catch (err) {
    next(err);
  }
};
