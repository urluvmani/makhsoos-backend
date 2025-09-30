import express from "express";
import Product from "../models/Product.js";
import { protectAdmin } from "./adminRoutes.js"; // ✅ middleware import

const router = express.Router();

// @desc   Get all products
// @route  GET /api/products
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// @desc   Get single product by ID
// @route  GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: "Invalid Product ID" });
  }
});

// @desc   Create new product (Admin only)
// @route  POST /api/products
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    const product = new Product({ name, description, price, image });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: "Error creating product", error: error.message });
  }
});

// @desc   Update product (Admin only)
// @route  PUT /api/products/:id
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, description, price, image } = req.body;
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.image = image || product.image;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
});

// @desc   Delete product (Admin only)
// @route  DELETE /api/products/:id
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
});

export default router;
