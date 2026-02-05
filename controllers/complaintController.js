const Complaint = require("../models/Complaint");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ---------------- NODEMAILER SETUP ----------------
const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Save to Database
    const newComplaint = new Complaint({ name, branch, pinNumber, message, email });
    await newComplaint.save();

    // 2. Transporter using your .env names
// 2. Transporter using Explicit Host and Port
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // Using 465 for SSL (More stable on cloud hosts)
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Optional: Add a timeout limit to prevent long hangs
      connectionTimeout: 10000, // 10 seconds
    });

    // 3. Send Email (Non-blocking)
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "sanathmandala391@gmail.com",
      subject: "🧾 New Complaint Submitted",
      text: `New complaint from ${name}\nPIN: ${pinNumber}\nMessage: ${message}`,
    }).catch(err => console.error("Email failed:", err));

    res.status(201).json({ message: "Complaint submitted successfully" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
};
// ---------------- GET ALL COMPLAINTS ----------------
const getcomplaint = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({
      error: "Failed to fetch complaints",
    });
  }
};

module.exports = {
  addComplaint,getcomplaint
};

