import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const router = express.Router();

// Get Cart
router.get("/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId");
    if (cart) {
      res.json(cart);
    } else {
      res.json({ items: [], total: 0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// Add to Cart
router.post("/:userId", async (req, res) => {
  const { productId, qty } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      cart = new Cart({ userId: req.params.userId, items: [], total: 0 });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.qty += qty;
    } else {
      cart.items.push({ productId, qty });
    }

    // ✅ Product price fetch from DB
    let total = 0;
    for (let item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.qty;
    }
    cart.total = total;

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// Clear Cart
router.delete("/:userId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ items: [], total: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

export default router;
