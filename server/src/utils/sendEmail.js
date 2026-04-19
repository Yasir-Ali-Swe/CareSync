export const sendEmail = async ({ to, subject, html, text }) => {
  throw new Error(
    "Deprecated: use services/email.service.js for all email operations via centralized Gmail transporter.",
  );
};
