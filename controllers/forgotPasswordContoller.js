const nodemailer = require("nodemailer");
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

// Forgot Password: Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email, role } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${role.toUpperCase()} Password Reset OTP`,
      html: `
        <h3>Hello ${user.name || role},</h3>
        <p>Your OTP for password reset is: <b>${otp}</b></p>
        <p>This OTP will expire in 10 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP", error });
  }
};

// Reset Password: Verify OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, role, otp, password } = req.body;
    const Model = getModelByRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid role" });

    const user = await Model.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify OTP
    if (!user.otp || user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error resetting password", error });
  }
};
