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
// 📌 Place new order (PUBLIC)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    console.log("🚀 New order request received:", { name, email, total });

    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items,
      total,
      status: "Pending",
    });

    // 📧 Confirmation email bhejo (with logs)
    if (email) {
      console.log("📧 About to call sendEmail() with:", email);
      try {
        await sendEmail(
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
        );
        console.log("✅ Order confirmation email sent to:", email);
      } catch (err) {
        console.error("❌ Failed to send order confirmation email:", err.message);
      }
    } else {
      console.warn("⚠️ No email provided, skipping confirmation email");
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("❌ Error placing order:", error.message);
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
});


// 📌 Customer can fetch their own orders (no login required)
// Optionally filter by phone/email
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

    // 📧 Status update email
    if (order.email) {
      try {
        await sendEmail(
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
        );
        console.log("✅ Order status update email sent to:", order.email);
      } catch (err) {
        console.error("❌ Failed to send status update email:", err.message);
      }
    }

    res.json({ message: "Order status updated & email sent", order });
  } catch (error) {
    console.error("❌ Error updating order status:", error.message);
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
});

export default router;
