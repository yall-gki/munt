import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // If SMTP is not configured, log and return success (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("⚠️ SMTP not configured. Email would be sent to:", to);
    console.warn("Subject:", subject);
    console.warn("In production, configure SMTP_USER and SMTP_PASSWORD env variables");
    return { success: true, messageId: "mock" };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

export function getEmailVerificationHtml(token: string, email: string) {
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email
      </a>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">${url}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">This link will expire in 24 hours.</p>
    </div>
  `;
}

export function getPasswordResetHtml(token: string, email: string) {
  const url = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset your password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #666;">${url}</p>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
}
