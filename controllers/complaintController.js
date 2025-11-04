const Complaint = require("../models/Complaint");
const transporter = require("../mailer");
const path = require("path");

const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(401).json({ message: "All fields are required" });
    }

    // Save complaint to database
    const newComplaint = new Complaint({
      name,
      branch,
      pinNumber,
      message,
      email,
    });
    await newComplaint.save();

    // ✅ Send email to ADMIN only
    await transporter.sendMail({
      from: process.env.COLLEGE_EMAIL,
      to: process.env.COLLEGE_EMAIL, // admin email (your Gmail)
      subject: "New Complaint Submitted - College Portal",
      text: `A new complaint has been submitted:\n\nName: ${name}\nBranch: ${branch}\nPin: ${pinNumber}\nEmail: ${email}\nMessage: ${message}\n\nPlease review it in the admin panel.`,
    });

    res.status(201).json({ message: "Complaint submitted successfully and sent to admin" });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getcomplaint = async (req, res) => {
  try {
    const complaint = await Complaint.find();
    res.status(200).json(complaint);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch the complaints" });
  }
};

module.exports = { addComplaint, getcomplaint };
