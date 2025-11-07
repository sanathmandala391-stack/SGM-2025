const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();

// ✅ Setup Nodemailer (Requires EMAIL_USER and EMAIL_PASS in your .env file)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App password (not your real Gmail password)
  },
});

// ---------------- 1. STUDENT REGISTER ----------------
const studentRegister = async (req, res) => {
  try {
    const { name, email, pinNumber, password, phone } = req.body;

    // Check if email or phone already exists
    const existing = await Student.findOne({ $or: [{ email }, { phone }] });
    if (existing) return res.status(400).json({ message: "Email or Phone already registered" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, pinNumber, phone, password: hashedPassword });
    await student.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 2. STUDENT LOGIN ----------------
const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid email" });

    // Compare provided password with hashed password
    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(400).json({ message: "Invalid password" });

    // Successful login (You would typically generate a JWT here)
    res.json({ message: "Login successful", studentId: student._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- 3. FORGOT PASSWORD (SEND OTP) ----------------
const studentForgotPassword = async (req, res) => {
  try {
    const { phone } = req.body;
    const student = await Student.findOne({ phone });
    if (!student) return res.status(404).json({ message: "Phone not registered" });

    // Generate and save OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    student.otp = otp;
    student.otpExpire = Date.now() + 5 * 60 * 1000; // expires in 5 min
    await student.save();

    // Send OTP email (using Nodemailer)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student.email, // Sent to the registered email
      subject: "Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
    });

    res.json({ message: "OTP sent successfully to your registered email" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// ---------------- 4. VERIFY OTP ----------------
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const student = await Student.findOne({ phone });
    if (!student) return res.status(404).json({ message: "Student not found" });
    
    // Check OTP match and expiration
    if (student.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > student.otpExpire) return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// ---------------- 5. RESET PASSWORD ----------------
const resetPassword = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const student = await Student.findOne({ phone });

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check OTP match and expiration
    if (student.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });
    if (Date.now() > student.otpExpire) return res.status(400).json({ message: "OTP expired" });

    // Hash the new password and clear OTP fields
    student.password = await bcrypt.hash(newPassword, 10);
    student.otp = undefined;
    student.otpExpire = undefined;
    await student.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// Export all controller functions
module.exports={studentRegister,studentLogin,studentForgotPassword,verifyOtp,resetPassword}