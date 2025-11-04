const Complaint = require("../models/Complaint");
const resend = require("../mailer");

const addComplaint = async (req, res) => {
  try {
    const { name, branch, pinNumber, message, email } = req.body;

    if (!name || !branch || !pinNumber || !message || !email) {
      return res.status(401).json({ message: "All fields are required" });
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

    console.log("Sending complaint email via Resend...");

    // ✅ Send email using Resend (not Nodemailer)
    await resend.emails.send({
      from: "College Portal <onboarding@resend.dev>", // this must be a verified sender domain
      to: "sanathmandala391@gmail.com", // your admin Gmail
      subject: "🧾 New Complaint Submitted",
      text: `A new complaint has been submitted:

Name: ${name}
Branch: ${branch}
Pin: ${pinNumber}
Email: ${email}
Message: ${message}

Please review it soon.`,
    });

    res.status(201).json({ message: "Complaint submitted successfully and sent to admin" });
  } catch (err) {
    console.error("Error submitting complaint:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getcomplaint = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    res.status(200).json(complaints);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
};

module.exports = { addComplaint, getcomplaint };
