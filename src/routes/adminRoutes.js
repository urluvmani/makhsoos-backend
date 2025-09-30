import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

// 🔑 Admin Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (admin && (await admin.matchPassword(password))) {
      const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Set cookie
      res.cookie("adminToken", token, {
        httpOnly: true,
        secure: false, // true if HTTPS
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.json({ message: "Admin login successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// 🔒 Middleware for protecting admin routes
export const protectAdmin = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized as admin" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token failed" });
  }
};
router.get("/check", protectAdmin, (req, res) => {
  res.json({ isAdmin: true });
});


export default router;
