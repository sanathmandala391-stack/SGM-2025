const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COLLEGE_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;
