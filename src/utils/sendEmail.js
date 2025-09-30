import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    // ✅ Gmail transporter (primary)
    const gmailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await gmailTransporter.sendMail({
        from: `"Makhsoos Store" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
      });
      console.log("✅ Email sent successfully via Gmail");
      return;
    } catch (gmailError) {
      console.error("❌ Gmail failed:", gmailError.message);
    }

    // -------------------------------
    // 🔄 Fallback: Brevo / Resend SMTP
    // -------------------------------
    if (process.env.FALLBACK_USER && process.env.FALLBACK_PASS) {
      const fallbackTransporter = nodemailer.createTransport({
        host: process.env.FALLBACK_HOST || "smtp-relay.sendinblue.com", // Brevo default
        port: process.env.FALLBACK_PORT || 587,
        secure: false,
        auth: {
          user: process.env.FALLBACK_USER,
          pass: process.env.FALLBACK_PASS,
        },
      });

      await fallbackTransporter.sendMail({
        from: `"Makhsoos Store" <${process.env.FALLBACK_USER}>`,
        to,
        subject,
        text,
      });
      console.log("✅ Email sent successfully via fallback SMTP");
    } else {
      console.error("⚠️ No fallback SMTP configured. Email not sent.");
    }
  } catch (error) {
    console.error("❌ Email error (all transports failed):", error.message);
  }
};

export default sendEmail;
