const Complaint = require("../models/Complaint");
const transporter = require("../mailer"); // import mailer
const path = require("path");

const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body; // include email

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(401).json({ message: "All fields are required" });
    }

    // Save complaint in database
    const newComplaint = new Complaint({
      name,
      branch,
      pinNumber,
      message,
      email,
    });
    await newComplaint.save();

    // ✅ Send confirmation email to student
    await transporter.sendMail({
      from: process.env.COLLEGE_EMAIL,
      to: email,
      subject: "Complaint Received - College Portal",
      text: `Hello ${name},\n\nYour complaint has been successfully submitted.\n\nDetails:\nBranch: ${branch}\nPin: ${pinNumber}\nMessage: ${message}\n\nWe’ll review it soon.\n\n- College Administration`,
    });

    res
      .status(201)
      .json({ message: "Complaint submitted successfully and email sent" });
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
