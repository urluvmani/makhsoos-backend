import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sendEmail from "./utils/sendEmail.js";

dotenv.config();

// ✅ Connect Database
connectDB();

const app = express();

// ✅ Only ONE clean CORS setup
const allowedOrigins = [
  "http://localhost:5173",   // Local frontend (Vite)
  "http://localhost:3000",   // CRA frontend
  "https://makhsoos.vercel.app" // Production frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Handle JSON & Cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Makhsoos Backend is Running 🚀 with MongoDB + Cookies");
});

app.get("/test-email", async (req, res) => {
  try {
    await sendEmail("yourEmail@gmail.com", "Test Email", "Hello from backend");
    res.send("✅ Email sent test route");
  } catch (err) {
    console.error("❌ Test email error:", err.message);
    res.status(500).send("Failed: " + err.message);
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
