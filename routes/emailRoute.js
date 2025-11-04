const express = require("express");
const router = express.Router();
const transporter = require("../mailer");

router.get("/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.COLLEGE_EMAIL,
      to: "sanathmandala391@gmail.com", 
      subject: "Test Email from College Portal",
      text: "Hello! This is a test email sent using Nodemailer + Gmail App Password.",
    });
    res.send("✅ Email sent successfully: " + info.response);
  } catch (err) {
    console.error("Email send failed:", err);
    res.status(500).send("❌ Error sending email: " + err.message);
  }
});

module.exports = router;
