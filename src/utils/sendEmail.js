import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // ✅ ya phir SMTP provider ka naam
      auth: {
        user: process.env.EMAIL_USER, // .env me rakho
        pass: process.env.EMAIL_PASS, // app password use karo
      },
    });

    await transporter.sendMail({
      from: `"Makhsoos Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

export default sendEmail;
