// mailer.js
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send email using Resend API
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML content
 */
async function sendEmail({ to, subject, html }) {
  return await resend.emails.send({
    from: "onboarding@yourdomain.com", // verified sender in Resend dashboard
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
