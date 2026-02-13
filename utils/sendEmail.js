import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  await transporter.sendMail({
    from: `"HealthSync" <no-reply@studenthealth.in>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
