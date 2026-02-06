const Complaint = require("../models/Complaint");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ✅ Use 'service: gmail' - it's the most reliable for Node 24/Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Use 16-digit Google App Password
  },
});

// ---------------- ADD COMPLAINT ----------------
const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1. Save to MongoDB
    const newComplaint = new Complaint({ name, branch, pinNumber, message, email });
    await newComplaint.save();

    // 2. Attempt to Send Email
    try {
      await transporter.sendMail({
        from: `"College Complaint System" <${process.env.SMTP_USER}>`,
        to: "sanathmandala391@gmail.com",
        subject: "🧾 New Complaint Submitted",
        text: `
          New complaint received:
          
          Name: ${name}
          PIN: ${pinNumber}
          Student Email: ${email}
          Branch: ${branch}
          
          Message:
          ${message}
        `,
      });
      console.log("✅ Email sent successfully");
      return res.status(201).json({ success: true, message: "Complaint submitted and email sent!" });
    } catch (emailError) {
      console.error("❌ SMTP Error:", emailError.message);
      // We return 201 because it's in the DB, but we tell the user there was a mail glitch
      return res.status(201).json({ success: true, message: "Complaint saved, but email notification failed." });
    }

  } catch (error) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

const getcomplaint = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

module.exports = { addComplaint, getcomplaint };