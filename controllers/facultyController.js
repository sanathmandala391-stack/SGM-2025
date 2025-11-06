const Faculty = require("../models/Faculty");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const transporter = require("../mailer");
const express = require("express");

dotenv.config();
const secretKey = process.env.WhatIsYourName;

// ---------------- FACULTY REGISTER ----------------
const facultyRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newFaculty = new Faculty({
      name,
      email,
      password: hashedPassword,
    });
    await newFaculty.save();

    const token = jwt.sign({ facultyId: newFaculty._id }, secretKey, {
      expiresIn: "24h",
    });

    res.status(201).json({
      message: "Faculty registered successfully",
      token,
      facultyId: newFaculty._id,
      name: newFaculty.name,
      email: newFaculty.email,
    });
    console.log("Registered:", newFaculty.email);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- FACULTY LOGIN ----------------
const facultyLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const faculty = await Faculty.findOne({ email });
    if (!faculty || !(await bcrypt.compare(password, faculty.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ facultyId: faculty._id }, secretKey, {
      expiresIn: "24h",
    });

    res.status(200).json({
      success: "Login successful",
      token,
      facultyId: faculty._id,
      name: faculty.name,
      email: faculty.email,
    });

    console.log(`${email} logged in - token ${token}`);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------- GET ALL FACULTY ----------------
const getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find();
    res.status(200).json(faculty);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
};

// ---------------- FORGOT PASSWORD ----------------
const facultyForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      return res.status(404).json({ message: "No faculty found with that email" });
    }

    const token = jwt.sign({ id: faculty._id }, process.env.WhatIsYourName, {
      expiresIn: "10m",
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/faculty/${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Faculty Password Reset",
      html: `
        <p>Hello ${faculty.name},</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending reset link" });
  }
};

// ---------------- RESET PASSWORD ----------------
const facultyResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
 
        console.log("🔹 Received token:", token);

    if (!token || token === "undefined") {
      return res.status(400).json({ message: "Invalid or missing token" });
    }


    const decoded = jwt.verify(token, process.env.WhatIsYourName);
    const faculty = await Faculty.findById(decoded.id);

    if (!faculty) {
      return res.status(400).json({ message: "Invalid token or user not found" });
    }

    const hashed = await bcrypt.hash(password, 10);
    faculty.password = hashed;
    await faculty.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reset failed or token expired" });
  }
};

// ---------------- EXPORTS ----------------
module.exports = {
  facultyRegister,
  facultyLogin,
  getFaculty,
  facultyForgotPassword,
  facultyResetPassword,
};
