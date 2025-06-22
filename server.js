// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
dotenv.config();
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Logging middleware
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const subCategoryRoutes = require("./routes/subCategoryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/categories", authMiddleware, categoryRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/subcategories", authMiddleware, subCategoryRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

// DB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
  });
