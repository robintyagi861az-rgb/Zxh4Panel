import nodemailer from "nodemailer";
import { adminDb } from "@/firebaseAdmin";
import type { SmtpSettings } from "@/types";

async function getTransport() {
  const snap = await adminDb.doc("system_settings/smtp").get();
  if (!snap.exists) throw new Error("SMTP is not configured yet.");
  const settings = snap.data() as SmtpSettings;

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.appPassword },
  });

  return { transporter, settings };
}

function emailShell(title: string, bodyHtml: string) {
  return `
  <div style="background:#080510;padding:40px 16px;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#141022;border:1px solid rgba(255,255,255,0.08);
      border-radius:16px;overflow:hidden;box-shadow:0 0 30px rgba(168,85,247,0.2);">
      <div style="padding:28px 32px;background:linear-gradient(90deg,#7C3AED,#D946EF);">
        <h1 style="margin:0;color:#fff;font-size:20px;letter-spacing:.3px;">ZXH4 Panel</h1>
      </div>
      <div style="padding:32px;color:#F4F2FB;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#fff;text-shadow:0 0 10px rgba(167,139,250,.5);">${title}</h2>
        <div style="font-size:14px;line-height:1.6;color:#cfc9e0;">${bodyHtml}</div>
      </div>
      <div style="padding:18px 32px;border-top:1px solid rgba(255,255,255,0.06);color:#6f6685;font-size:12px;">
        This is an automated message from ZXH4 Panel. Please do not reply directly to this email.
      </div>
    </div>
  </div>`;
}

export async function sendWalletCreditEmail(to: string, amount: number) {
  const { transporter, settings } = await getTransport();
  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.user}>`,
    to,
    subject: "Your wallet has been credited",
    html: emailShell(
      "Wallet Topped Up",
      `Your Wallet has been credited! <strong style="color:#A78BFA;">$${amount.toFixed(
        2
      )}</strong> has been added by the admin team.`
    ),
  });
}

export async function sendWalletDebitEmail(to: string, amount: number) {
  const { transporter, settings } = await getTransport();
  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.user}>`,
    to,
    subject: "Your wallet has been debited",
    html: emailShell(
      "Wallet Adjusted",
      `Your Wallet has been debited! <strong style="color:#A78BFA;">$${amount.toFixed(
        2
      )}</strong> has been deducted from your account.`
    ),
  });
}

export async function sendOrderStatusEmail(to: string, orderId: string, status: string) {
  const { transporter, settings } = await getTransport();
  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.user}>`,
    to,
    subject: `Order Update: #${orderId}`,
    html: emailShell(
      "Order Status Update",
      `Your order <strong style="color:#A78BFA;">#${orderId}</strong> status has changed to <strong>${status}</strong>.`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, codeOrLink: string) {
  const { transporter, settings } = await getTransport();
  await transporter.sendMail({
    from: `"${settings.fromName}" <${settings.user}>`,
    to,
    subject: "Reset your password",
    html: emailShell(
      "Password Reset Requested",
      `Use the code below to reset your password. It expires in 15 minutes.<br/><br/>
       <div style="font-size:28px;letter-spacing:6px;font-weight:700;color:#fff;
         background:#080510;border:1px solid rgba(167,139,250,.4);border-radius:12px;
         padding:14px 0;text-align:center;">${codeOrLink}</div>
       <br/>If you didn't request this, you can safely ignore this email.`
    ),
  });
}

export async function sendBroadcastEmail(recipients: string[], subject: string, bodyHtml: string) {
  const { transporter, settings } = await getTransport();
  // Sent as BCC batches of 50 to stay within typical SMTP recipient limits.
  const batchSize = 50;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.user}>`,
      to: settings.user,
      bcc: batch,
      subject,
      html: emailShell(subject, bodyHtml),
    });
  }
}
