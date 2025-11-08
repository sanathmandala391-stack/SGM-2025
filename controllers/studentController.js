const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Setup Nodemailer with Brevo SMTP (for your verified domain)
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // Use true only for port 465
  auth: {
    user: process.env.SMTP_USER, // Brevo System Login
    pass: process.env.SMTP_PASS, // Brevo SMTP Key
  },
});

// --- 1. STUDENT REGISTER ---
const studentRegister = async (req, res) => {
  try {
    const { name, email, pinNumber, password, phone } = req.body;
    if (!name || !email || !pinNumber || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check if email, phone, or pinNumber already exists
    const existing = await Student.findOne({
      $or: [
        { email: lowerCaseEmail },
        { phone },
        { pinNumber }
      ]
    });
    if (existing) return res.status(400).json({ message: "Email, Phone or PinNumber already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      name,
      email: lowerCaseEmail,
      pinNumber,
      password: hashedPassword,
      phone
    });
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

// --- 2. STUDENT LOGIN ---
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const lowerCaseEmail = email.toLowerCase();
    const student = await Student.findOne({ email: lowerCaseEmail });
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
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// --- 3. FORGOT PASSWORD (SEND OTP) ---
const studentForgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone number is required" });

    const student = await Student.findOne({ phone });
    if (!student) return res.status(404).json({ message: "Phone number not registered" });

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    student.otp = otp;
    student.otpExpire = Date.now() + 5 * 60 * 1000; // 5 minutes
    await student.save();

    // ⚠️ CRITICAL: Use your VERIFIED SENDER EMAIL here (e.g., SGM@sgm47.work.gd)
const info = await transporter.sendMail({
        from: "SGM@sgm47.work.gd", 
        to: student.email,
        subject: "Password Reset OTP",
        html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    // 👇 DEBUGGING: Check your console for this output!
    console.log("--- EMAIL DELIVERY STATUS ---");
    console.log(`Recipient Email (from DB): ${student.email}`);
    console.log(`Brevo Response Code: ${info.responseCode}`);
    console.log(`Accepted Recipients: ${info.accepted.join(', ')}`);
    console.log(`Rejected Recipients: ${info.rejected.join(', ')}`);
    console.log("-----------------------------");
    
    if (info.rejected.length > 0) {
      // If the email was immediately rejected by the SMTP server
      return res.status(500).json({ message: "Email rejected by Brevo. Check recipient address and Brevo logs." });
    }

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

// --- 4. VERIFY OTP ---
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ message: "Phone number and OTP are required." });

    const student = await Student.findOne({ phone });
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (student.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > student.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// --- 5. RESET PASSWORD ---
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) return res.status(400).json({ message: "Phone, OTP, and new password are required." });

    const student = await Student.findOne({ phone });
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

module.exports = { studentRegister, studentLogin, studentForgotPassword, verifyOtp, resetPassword };