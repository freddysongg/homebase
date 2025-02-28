import nodemailer from "nodemailer";
import mongoose from "mongoose";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const message = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Email Verification - HomeBase",
    html: `
      <h1>Verify Your Email</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
    `,
  };

  await transporter.sendMail(message);
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const message = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Password Reset - HomeBase",
    html: `
      <h1>Reset Your Password</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(message);
};

export const sendEmail = async (notification) => {
  const message = {
    from: process.env.SMTP_FROM,
    to: await getRecipientEmails(notification.recipient_ids),
    subject: notification.title,
    html: `
      <h1>${notification.title}</h1>
      <p>${notification.message}</p>
      <a href="${process.env.FRONTEND_URL}/notifications/${notification._id}">View in HomeBase</a>
    `,
  };

  await transporter.sendMail(message);
};

// Helper function to get recipient emails
const getRecipientEmails = async (recipientIds) => {
  const User = mongoose.model("User");
  const users = await User.find({
    _id: { $in: recipientIds },
    "preferences.notifications.email": true,
  });
  return users.map((user) => user.email);
};
