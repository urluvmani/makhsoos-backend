import express from "express";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "tumhara-email@gmail.com", // 🔹 یہاں اپنا اصلی Gmail لکھو
      "Test Email from Makhsoos Store",
      "یہ ایک ٹیسٹ ای میل ہے تاکہ پتا چلے کہ SMTP صحیح چل رہا ہے۔"
    );

    res.json({ message: "✅ Test email sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Failed to send test email", error: error.message });
  }
});

export default router;
