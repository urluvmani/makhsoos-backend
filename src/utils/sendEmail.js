import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  console.log("🚀 sendEmail() function CALLED");
console.log("To:", to, "Subject:", subject);

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
  logger: true,   // 🔎 log SMTP conversation
  debug: true     // 🔎 show debug output
});

// connection test
gmailTransporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to take messages");
  }
});


    await gmailTransporter.sendMail({
      from: `"Makhsoos Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`✅ Email sent successfully via Gmail → ${to}`);
    return true;
  } catch (gmailError) {
    console.error("❌ Gmail failed:", gmailError.message);

    // Fallback Transporter (Sendinblue/Brevo)
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
        throw new Error("Both Gmail & Fallback SMTP failed.");
      }
    } else {
      throw new Error("⚠️ No fallback SMTP configured.");
    }
  }
};

export default sendEmail;
