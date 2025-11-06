const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");


const getModelByRole = (role) => {
  if (role === "admin") return Admin;
  if (role === "student") return Student;
  if (role === "faculty") return Faculty;
  return null;
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure:true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${role}/${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${role.toUpperCase()} Password Reset`,
      html: `
        <h3>Hello ${user.name || role},</h3>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error sending reset link", error });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token, role } = req.params;
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
    res.status(500).json({ message: "Error resetting password", error });
  }
};
