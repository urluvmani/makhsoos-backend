import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import testEmailRoutes from "./routes/testEmailRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";


dotenv.config();

// ✅ Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "https://makhsoos.vercel.app/"], 
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", testEmailRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Makhsoos Backend is Running 🚀 with MongoDB + Cookies");
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
