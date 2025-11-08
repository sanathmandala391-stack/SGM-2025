const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Setup Nodemailer (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App password
  },
});

// ---------------- 1. STUDENT REGISTER ----------------
const studentRegister = async (req, res) => {
  try {
    const { name, email, pinNumber, password, phone } = req.body;

    if (!name || !email || !pinNumber || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Student.findOne({
      $or: [{ email }, { phone }, { pinNumber }]
    });
    if (existing) return res.status(400).json({ message: "Email, Phone or PinNumber already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, pinNumber, password: hashedPassword, phone });
    await student.save();

    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.WhatIsYourName,
      { expiresIn: "1d" }
    );

    res.status(201).json({ message: "Student registered successfully", token, studentId: student._id, name: student.name });
  } catch (err) {
    console.error("Student registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 2. STUDENT LOGIN ----------------
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid email" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: student._id, email: student.email },
      process.env.WhatIsYourName,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token, studentId: student._id, name: student.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 3. FORGOT PASSWORD (SEND OTP) ----------------
const studentForgotPassword = async (req, res) => {
  try {
    const { email } = req.body; // use email instead of phone
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Email not registered" });

    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    student.otp = otp;
    student.otpExpire = Date.now() + 5 * 60 * 1000; // 5 min
    await student.save();

    console.log(`Generated OTP for ${student.email}: ${otp}`); // for testing

    // Send OTP email safely
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
      });
      console.log("OTP sent successfully");
      res.json({ message: "OTP sent successfully to your registered email" });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError.message);
      res.status(500).json({ message: "Failed to send OTP email", error: emailError.message });
    }
  } catch (err) {
    console.error("Error in forgot-password:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- 4. VERIFY OTP ----------------
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > student.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ---------------- 5. RESET PASSWORD ----------------
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > student.otpExpire) return res.status(400).json({ message: "OTP expired" });

    student.password = await bcrypt.hash(newPassword, 10);
    student.otp = undefined;
    student.otpExpire = undefined;
    await student.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = {
  studentRegister,
  studentLogin,
  studentForgotPassword,
  verifyOtp,
  resetPassword
};
