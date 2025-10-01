import express from "express";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import { protectAdmin } from "./adminRoutes.js";

const router = express.Router();

/**
 * --------------------------
 * PUBLIC ROUTES (CUSTOMER)
 * --------------------------
 */

// 📌 Place new order (PUBLIC)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    console.log("🚀 New order request received:", { name, email, total });

    // ✅ Save order in DB
    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items,
      total,
      status: "Pending",
    });

    // ✅ Immediately respond to frontend
    res.status(201).json(order);

    // 📧 Background email (non-blocking)
    if (email) {
      sendEmail(
        email,
        "Order Confirmation - Makhsoos Store",
        `
Dear ${name},

✅ Thank you for your order!
Order ID: ${order._id}
Status: ${order.status}
Total: Rs. ${total}

We will update you once your order is shipped.

Regards,
Makhsoos Store
        `
      )
        .then(() => console.log("✅ Confirmation email sent to:", email))
        .catch((err) =>
          console.error("❌ Email sending failed (ignored):", err.message)
        );
    } else {
      console.warn("⚠️ No email provided, skipping confirmation email");
    }
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res
      .status(500)
      .json({ message: "Error placing order", error: error.message });
  }
});

// 📌 Customer can fetch their own orders
router.get("/", async (req, res) => {
  try {
    const { email, phone } = req.query;
    const filter = {};
    if (email) filter.email = email;
    if (phone) filter.phone = phone;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error.message);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// 📌 Cancel order (PUBLIC)
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("❌ Error cancelling order:", error.message);
    res.status(500).json({ message: "Error cancelling order" });
  }
});

/**
 * --------------------------
 * ADMIN ROUTES (PROTECTED)
 * --------------------------
 */

// 📌 Admin: fetch all orders
router.get("/all", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("❌ Error fetching all orders:", error.message);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// 📌 Admin: update status
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status || order.status;
    await order.save();

    res.json({ message: "Order status updated", order });

    // 📧 Background email for status update
    if (order.email) {
      sendEmail(
        order.email,
        "Order Status Update - Makhsoos Store",
        `
Dear ${order.name},

ℹ️ Your order (ID: ${order._id}) status has been updated.
Current Status: ${order.status}

Thank you for shopping with us!
Regards,
Makhsoos Store
        `
      )
        .then(() =>
          console.log("✅ Status update email sent to:", order.email)
        )
        .catch((err) =>
          console.error("❌ Status update email failed (ignored):", err.message)
        );
    }
  } catch (error) {
    console.error("❌ Error updating order status:", error.message);
    res
      .status(500)
      .json({ message: "Error updating order status", error: error.message });
  }
});

export default router;
