import axios from "axios";

const sendEmail = async ({ to, subject, html }) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "HealthSync",
          email: "no-reply@studenthealth.in",
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log("✅ Email sent via Brevo API to:", to);
  } catch (error) {
    console.error("❌ Brevo API Error:", error.response?.data || error.message);
    throw error;
  }
};

export default sendEmail;
