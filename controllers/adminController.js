const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Setup Nodemailer with Brevo SMTP (Corrected)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use true only for port 465
  auth: {
    user: process.env.SMTP_USER, // Brevo System Login
    pass: process.env.SMTP_PASS, // Brevo SMTP Key
  },
});

// ---------------- 1. ADMIN REGISTER ----------------
const adminRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const lowerCaseEmail = email.toLowerCase();
    const existing = await Admin.findOne({ $or: [{ email: lowerCaseEmail }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email: lowerCaseEmail, phone, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 2. ADMIN LOGIN ----------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: lowerCaseEmail });
    if (!admin) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    // Generate JWT
    const token = jwt.sign(
      { adminId: admin._id, name: admin.name },
      process.env.WhatIsYourName,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token, name: admin.name });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 3. ADMIN FORGOT PASSWORD (via Email) ----------------
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    
    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: lowerCaseEmail });
    if (!admin) return res.status(404).json({ message: "Email not registered" });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    admin.otp = otp;
    admin.otpExpire = Date.now() + 5 * 60 * 1000;
    await admin.save();

const info = await transporter.sendMail({
        from: "SGM@sgm47.work.gd", // 👈 Verified Sender Email
        to: admin.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ---------------- 4. VERIFY OTP (via Email) ----------------
const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: lowerCaseEmail });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > admin.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ---------------- 5. RESET PASSWORD (via Email) ----------------
const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: "Email, OTP, and new password are required" });
    
    const lowerCaseEmail = email.toLowerCase();
    const admin = await Admin.findOne({ email: lowerCaseEmail });

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > admin.otpExpire) return res.status(400).json({ message: "OTP expired" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = undefined;
    admin.otpExpire = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  adminRegister,
  adminLogin,
  adminForgotPassword,
  verifyAdminOtp,
  resetAdminPassword,
};