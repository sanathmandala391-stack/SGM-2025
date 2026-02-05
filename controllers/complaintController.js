const Complaint = require("../models/Complaint");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ---------------- NODEMAILER SETUP ----------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail
    pass: process.env.EMAIL_PASS, // App Password
  },
});

// ---------------- ADD COMPLAINT ----------------
const addComplaint = async (req, res) => {
  try {
    console.log("Request Body:", req.body); // 🔍 Debug

    const { name, branch, pinNumber, message, email } = req.body;

    // Validate fields
    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save complaint to MongoDB
    const newComplaint = new Complaint({
      name,
      branch,
      pinNumber,
      message,
      email,
    });

    await newComplaint.save();

    console.log("Complaint saved successfully");

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER, // ✅ FIXED
      to: "sanathmandala391@gmail.com",
      subject: "🧾 New Complaint Submitted",
      text: `
A new complaint has been submitted:

Name: ${name}
Branch: ${branch}
Pin Number: ${pinNumber}
Email: ${email}

Message:
${message}

Please review it.
      `,
    });

    console.log("Email sent successfully");

    res.status(201).json({
      message: "Complaint submitted successfully",
    });
  } catch (error) {
    console.error("Error adding complaint:", error);
    res.status(500).json({
      error: "Failed to add complaint",
    });
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
  addComplaint,
  getcomplaint,
};
//Added//