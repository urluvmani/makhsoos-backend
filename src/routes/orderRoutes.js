import express from "express";
import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";
import { protectAdmin } from "./adminRoutes.js";

const router = express.Router();

// 📌 Place new order
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, address, items, total } = req.body;

    const order = await Order.create({
      name,
      email,
      phone,
      address,
      items,
      total,
      status: "Pending",
    });

    // 📧 Confirmation email bhejo customer ko
    const message = `
    Dear ${name},

    ✅ Thank you for your order!
    Order ID: ${order._id}
    Status: ${order.status}
    Total: Rs. ${total}

    We will update you once your order is shipped.

    Regards,  
    Makhsoos Store
    `;
    await sendEmail(email, "Order Confirmation - Makhsoos Store", message);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error placing order", error: error.message });
  }
});

// Admin only - fetch all orders
router.get("/", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});



// 📌 Update order status (Admin)
router.put("/:id/status", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = req.body.status || order.status;
    await order.save();

    // 📧 Status update email bhejo customer ko
    const message = `
    Dear ${order.name},

    ℹ️ Your order (ID: ${order._id}) status has been updated.
    Current Status: ${order.status}

    Thank you for shopping with us!  
    Regards,  
    Makhsoos Store
    `;
    await sendEmail(order.email, "Order Status Update - Makhsoos Store", message);

    res.json({ message: "Order status updated & email sent", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating order status", error: error.message });
  }
});

// 📌 Cancel order
router.delete("/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" });
  }
});

export default router;
