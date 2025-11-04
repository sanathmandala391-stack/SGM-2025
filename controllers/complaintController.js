const Complaint = require("../models/Complaint");
const transporter = require("../mailer"); 
const path = require("path");

const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newComplaint = new Complaint({
      name,
      branch,
      pinNumber,
      message,
      email,
    });
    await newComplaint.save();

    await transporter.emails.send({
      from: "College Portal <onboarding@resend.dev>",
      to: email,
      subject: "Complaint Received - College Portal",
      text: `Hello ${name},

Your complaint has been successfully submitted.

Details:
Branch: ${branch}
Pin: ${pinNumber}
Message: ${message}

We’ll review it soon.

- College Administration`,
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
