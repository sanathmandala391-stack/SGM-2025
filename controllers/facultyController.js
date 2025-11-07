/*const Faculty = require("../models/Faculty");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();

// Setup Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --------- REGISTER ---------
const facultyRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await Faculty.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or Phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ name, email, phone, password: hashedPassword });
    await faculty.save();

    res.status(201).json({ message: "Faculty registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------- LOGIN ---------
const facultyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, faculty.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    res.json({ message: "Login successful", facultyId: faculty._id, name: faculty.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// --------- FORGOT PASSWORD (SEND OTP) ---------
const facultyForgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const faculty = await Faculty.findOne({ phone });
    if (!faculty) return res.status(404).json({ message: "Phone not registered" });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    faculty.otp = otp;
    faculty.otpExpire = Date.now() + 5 * 60 * 1000;
    await faculty.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: faculty.email,
      subject: "Faculty Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// --------- VERIFY OTP ---------
const verifyFacultyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const faculty = await Faculty.findOne({ phone });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    if (faculty.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > faculty.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// --------- RESET PASSWORD ---------
const resetFacultyPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const faculty = await Faculty.findOne({ phone });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    if (faculty.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > faculty.otpExpire) return res.status(400).json({ message: "OTP expired" });

    faculty.password = await bcrypt.hash(newPassword, 10);
    faculty.otp = undefined;
    faculty.otpExpire = undefined;
    await faculty.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = { facultyRegister, facultyLogin, facultyForgotPassword, verifyFacultyOtp, resetFacultyPassword };*/
const Faculty = require("../models/Faculty");
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

// ---------------- FACULTY REGISTER ----------------
const facultyRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await Faculty.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or phone already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ name, email, phone, password: hashedPassword });
    await faculty.save();

    res.status(201).json({ message: "Faculty registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- FACULTY LOGIN ----------------
const facultyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, faculty.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { facultyId: faculty._id, name: faculty.name },
      process.env.WhatIsYourName,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      facultyId: faculty._id,
      facultyname: faculty.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- FACULTY FORGOT PASSWORD ----------------
const facultyForgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const faculty = await Faculty.findOne({ phone });
    if (!faculty) return res.status(404).json({ message: "Phone not registered" });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    faculty.otp = otp;
    faculty.otpExpire = Date.now() + 5 * 60 * 1000;
    await faculty.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: faculty.email,
      subject: "Faculty Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ---------------- VERIFY OTP ----------------
const verifyFacultyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const faculty = await Faculty.findOne({ phone });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    if (faculty.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > faculty.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ---------------- RESET PASSWORD ----------------
const resetFacultyPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const faculty = await Faculty.findOne({ phone });

    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    if (faculty.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > faculty.otpExpire) return res.status(400).json({ message: "OTP expired" });

    faculty.password = await bcrypt.hash(newPassword, 10);
    faculty.otp = undefined;
    faculty.otpExpire = undefined;
    await faculty.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  facultyRegister,
  facultyLogin,
  facultyForgotPassword,
  verifyFacultyOtp,
  resetFacultyPassword,
};
