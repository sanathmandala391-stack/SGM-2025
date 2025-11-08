const Complaint = require("../models/Complaint");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or another email provider
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App password if 2FA enabled
  },
});

// ---------------- ADD COMPLAINT ----------------
const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Save complaint in MongoDB
    const newComplaint = new Complaint({
      name,
      branch,
      pinNumber,
      message,
      email,
    });
    await newComplaint.save();

    console.log("Sending complaint email via Nodemailer...");

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "sanathmandala391@gmail.com", // admin email
        subject: "🧾 New Complaint Submitted",
        text: `A new complaint has been submitted:

Name: ${name}
Branch: ${branch}
Pin: ${pinNumber}
Email: ${email}
Message: ${message}

Please review it soon.`,
      });
      console.log("Email sent successfully");
    } catch (err) {
      console.error("Error sending email:", err);
      return res.status(500).json({ error: "Failed to send email" });
    }

    res.status(201).json({ message: "Complaint submitted successfully and email sent" });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ---------------- GET ALL COMPLAINTS ----------------
const getcomplaint = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

module.exports = { addComplaint, getcomplaint };
