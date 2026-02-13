import nodemailer from "nodemailer";
console.log("===== EMAIL DEBUG =====");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("BREVO_SMTP_HOST:", process.env.BREVO_SMTP_HOST);
console.log("BREVO_SMTP_PORT:", process.env.BREVO_SMTP_PORT);
console.log("BREVO_SMTP_USER:", process.env.BREVO_SMTP_USER);
console.log("BREVO_SMTP_PASS exists:", !!process.env.BREVO_SMTP_PASS);
console.log("=======================");

const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  if (process.env.NODE_ENV === "production") {
    // REAL EMAIL - BREVO
    transporter = nodemailer.createTransport({
      host: process.env.BREVO_SMTP_HOST,
      port: process.env.BREVO_SMTP_PORT,
      secure: false, // STARTTLS for port 587
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });
  } else {
    // TEST EMAIL - MAILTRAP (inactive now)
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

  console.log(
    process.env.NODE_ENV === "production"
      ? `📧 Real email request sent to: ${to}`
      : `📧 Email captured in Mailtrap for: ${to}`
  );
};

export default sendEmail;
