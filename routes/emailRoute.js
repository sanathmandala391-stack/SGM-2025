const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../mailer"); // <-- now Nodemailer
const Admin = require("../models/Admin");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");

const getModelByRole = (role) => {
  if (role === "admin") return Admin;
  if (role === "faculty") return Faculty;
  if (role === "student") return Student;
  return null;
};

router.post("/forgot-password", async (req, res) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${role}/${token}`;

    // Send email using Nodemailer
    await sendEmail({
      to: email,
      subject: `${role.toUpperCase()} Password Reset`,
      html: `
        <h3>Hello ${user.name || "User"},</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error sending reset email", error });
  }
});

module.exports = router;
