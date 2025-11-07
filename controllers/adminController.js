const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ---------------- ADMIN REGISTER ----------------
const adminRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await Admin.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ name, email, phone, password: hashedPassword });
    await admin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- ADMIN LOGIN ----------------
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- ADMIN FORGOT PASSWORD ----------------
const adminForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Email not registered" });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    admin.otp = otp;
    admin.otpExpire = Date.now() + 5 * 60 * 1000;
    await admin.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: admin.email,
      subject: "Admin Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ---------------- VERIFY OTP ----------------
const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > admin.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ---------------- RESET PASSWORD ----------------
const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > admin.otpExpire) return res.status(400).json({ message: "OTP expired" });

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.otp = undefined;
    admin.otpExpire = undefined;
    await admin.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
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
