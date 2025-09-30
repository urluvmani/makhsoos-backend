import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ abhi string rakho dummy ke liye
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, required: true, default: 1 },
      },
    ],
    total: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
