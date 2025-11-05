const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const resend = require("../mailer"); // your resend or nodemailer setup

// Import models
const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

// Helper
const getModelByRole = (role) => {
  if (role === "admin") return Admin;
  if (role === "faculty") return Faculty;
  if (role === "student") return Student;
  return null;
};

// ✅ Forgot Password (send reset link)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${role}/${token}`;

    // Send email (Resend)
    await resend.emails.send({
      from: "sanathmandala391@gmail.com",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h3>Hello ${user.name || "User"},</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    // 👉 For Postman testing — return token in response
    res.json({
      message: "Password reset email sent successfully",
      resetToken: token, // 👈 see this token in Postman
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending reset email", error });
  }
});

// ✅ Reset Password (verify token & update password)
router.post("/reset-password/:role/:token", async (req, res) => {
  try {
    const { role, token } = req.params;
    const { password } = req.body;

    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
});

module.exports = router;
