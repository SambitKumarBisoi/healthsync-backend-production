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
        to: [
          {
            email: to,
          },
        ],
        subject: subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Brevo API error:", error.response?.data || error.message);
    throw error;
  }
};

export default sendEmail;
