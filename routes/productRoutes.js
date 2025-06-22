const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  toggleFavorite,
  getFavoriteProducts,
} = require("../controllers/productController");

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.post("/favorite/:productId", toggleFavorite);
router.get(",favrite", getFavoriteProducts);

module.exports = router;
