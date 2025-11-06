const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  return await resend.emails.send({
    from: "onboarding@resend.dev", // your verified Gmail
    to,
    subject,
    html,
  });
}

module.exports = { sendEmail };
