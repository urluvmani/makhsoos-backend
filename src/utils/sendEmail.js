import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  console.log("🚀 sendEmail() called:", { to, subject });

  try {
    // Gmail Transporter
    const gmailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Directly send mail (skip verify inside request)
    await gmailTransporter.sendMail({
      from: `"Makhsoos Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent successfully → ${to}`);
    return true;
  } catch (gmailError) {
    console.error("❌ Gmail failed:", gmailError.message);

    // ✅ Fallback SMTP
    if (process.env.FALLBACK_USER && process.env.FALLBACK_PASS) {
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: process.env.FALLBACK_HOST || "smtp-relay.sendinblue.com",
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

        console.log(`✅ Email sent via Fallback SMTP → ${to}`);
        return true;
      } catch (fallbackError) {
        console.error("❌ Fallback failed:", fallbackError.message);
        // Don't throw further, just fail silently
        return false;
      }
    } else {
      console.warn("⚠️ No fallback SMTP configured, skipping email");
      return false;
    }
  }
};

export default sendEmail;
