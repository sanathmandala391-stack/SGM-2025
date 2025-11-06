/*const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = resend;*/

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER, // sgmcollege@zohomail.in
    pass: process.env.EMAIL_PASS, // Zoho App Password
  },
});

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "friend@example.com",
  subject: "Password Reset Request",
  html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
});

