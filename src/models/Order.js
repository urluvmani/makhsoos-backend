import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },       // customer name
    email: { type: String },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    total: { type: Number, required: true },
    status: { type: String, default: "Pending" }, // Pending / Cancelled / Completed
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
