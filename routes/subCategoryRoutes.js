const express = require("express");
const router = express.Router();
const {
  createSubCategory,
  getSubCategories,
  getCategoriesWithSubs,
} = require("../controllers/subCategoryController");

router.post("/", createSubCategory);
router.get("/", getSubCategories);
router.get("/all", getCategoriesWithSubs);

module.exports = router;
