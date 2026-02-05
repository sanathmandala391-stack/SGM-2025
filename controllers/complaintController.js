const Complaint = require("../models/Complaint");
const nodemailer = require("nodemailer");
require("dotenv").config();

// 1. Setup Transporter with POOLING 
// This is the most robust way to handle SMTP on cloud providers
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 2525, // Try this "alternative" port
  secure: false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ---------------- ADD COMPLAINT ----------------
const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Save to Database first
    const newComplaint = new Complaint({ name, branch, pinNumber, message, email });
    await newComplaint.save();

    // 3. Send Email (using await to catch timeouts)
    try {
      await transporter.sendMail({
        from: `"${name}" <${process.env.SMTP_USER}>`, // Proper sender format
        to: "sanathmandala391@gmail.com",
        subject: "🧾 New Complaint Submitted",
        text: `
          New complaint received:
          
          Name: ${name}
          PIN: ${pinNumber}
          Email: ${email}
          
          Message:
          ${message}
        `,
      });
      console.log("✅ Email sent successfully");
    } catch (emailError) {
      // Log the specific error for Render logs
      console.error("❌ SMTP Error:", emailError.code, emailError.message);
    }

    // We return 201 because the database save was successful
    res.status(201).json({ message: "Complaint submitted successfully" });

  } catch (error) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------------- GET COMPLAINTS ----------------
const getcomplaint = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

module.exports = { addComplaint, getcomplaint };