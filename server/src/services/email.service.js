import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { verificationEmailTemplate } from "../emailTemplates/verification-email-template.js";
import { resetPasswordEmailTemplate } from "../emailTemplates/reset-password-template.js";
import { appointmentConfirmationTemplate } from "../emailTemplates/appointment-confirmation-template.js";
import { appointmentReminderTemplate } from "../emailTemplates/appointment-reminder-template.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL,
    pass: env.EMAIL_PASSWORD,
  },
});

const ensureEmailConfig = () => {
  if (!env.EMAIL || !env.EMAIL_PASSWORD) {
    throw new Error("EMAIL and EMAIL_PASSWORD are required for email functionality");
  }
};

const sendMail = async ({ to, subject, html, text }) => {
  ensureEmailConfig();

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL,
      to,
      subject,
      html,
      text,
    });
    console.log(`Email sent to ${to} | subject: ${subject} | messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email failed to ${to} | subject: ${subject}`, error);
    throw error;
  }
};

export const emailService = {
  async sendVerificationEmail(toEmail, token, name = "there") {
    const verifyUrl = `${env.FRONTEND_URL}/verify-email/${token}`;
    const html = verificationEmailTemplate({
      appName: env.APP_NAME,
      name,
      verifyUrl,
      supportEmail: env.EMAIL,
    });

    return sendMail({
      to: toEmail,
      subject: "Verify your CareSync account",
      html,
      text: `Verify your email: ${verifyUrl}`,
    });
  },

  async sendResetPasswordEmail(toEmail, token, name = "there") {
    const resetUrl = `${env.FRONTEND_URL}/reset-password/${token}`;
    const html = resetPasswordEmailTemplate({
      appName: env.APP_NAME,
      name,
      resetUrl,
      supportEmail: env.EMAIL,
    });

    return sendMail({
      to: toEmail,
      subject: "Reset your CareSync password",
      html,
      text: `Reset your password: ${resetUrl}`,
    });
  },

  async sendAppointmentConfirmationEmail(toEmail, data = {}) {
    const {
      name = "there",
      doctorName = "Doctor",
      date = "",
      time = "",
    } = data;

    const html = appointmentConfirmationTemplate({
      appName: env.APP_NAME,
      name,
      doctorName,
      date,
      time,
      supportEmail: env.EMAIL,
    });

    return sendMail({
      to: toEmail,
      subject: "Appointment Confirmed - CareSync",
      html,
      text: `Your appointment with ${doctorName} is confirmed for ${date} ${time}`,
    });
  },

  async sendAppointmentReminderEmail(toEmail, data = {}) {
    const {
      name = "there",
      doctorName = "Doctor",
      date = "",
      time = "",
    } = data;

    const html = appointmentReminderTemplate({
      appName: env.APP_NAME,
      name,
      doctorName,
      date,
      time,
      supportEmail: env.EMAIL,
    });

    return sendMail({
      to: toEmail,
      subject: "Appointment Reminder - CareSync",
      html,
      text: `Reminder: you have an appointment with ${doctorName} at ${date} ${time}`,
    });
  },
};

export { sendMail };
