import nodemailer from "nodemailer";

const smtpHost = process.env.BODEMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.BODEMAIL_PORT || process.env.SMTP_PORT || "587");
const smtpUser = process.env.BODEMAIL_USER || process.env.SMTP_USER;
const smtpPass = process.env.BODEMAIL_PASSWORD || process.env.SMTP_PASSWORD;
const smtpFrom = process.env.BODEMAIL_FROM || process.env.SMTP_FROM || smtpUser;
const smtpSecureEnv = process.env.BODEMAIL_SECURE || process.env.SMTP_SECURE;
const smtpSecure = smtpSecureEnv ? smtpSecureEnv === "true" : smtpPort === 465;

function getTransporter() {
  if (!smtpUser || !smtpPass) {
    return null;
  }
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = getTransporter();
  const allowMock = process.env.EMAIL_ALLOW_MOCK === "true";
  if (!transporter || !smtpFrom) {
    const message = "Email transport not configured. Set SMTP/BODEMAIL env vars.";
    if (allowMock) {
      console.warn("⚠️", message);
      console.warn("Email would be sent to:", to);
      console.warn("Subject:", subject);
      return { success: true, messageId: "mock" };
    }
    throw new Error(message);
  }

  try {
    const info = await transporter.sendMail({
      from: smtpFrom,
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

export function getEmailVerificationHtml({
  email,
  token,
  otpCode,
}: {
  email: string;
  token?: string;
  otpCode?: string;
}) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = token
    ? `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    : `${baseUrl}/verify-email?email=${encodeURIComponent(email)}`;
  const otpTtlMinutes = parseInt(process.env.OTP_TTL_MINUTES || "10");
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify your email</h2>
      ${otpCode ? `
        <p>Use this one-time code to verify your email:</p>
        <div style="font-size: 28px; letter-spacing: 6px; font-weight: bold; margin: 16px 0; text-align: center;">
          ${otpCode}
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 8px;">
          This code will expire in ${otpTtlMinutes} minutes.
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
      ` : ""}
      ${token ? `
        <p>Or click the link below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">This link will expire in 24 hours.</p>
      ` : ""}
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
