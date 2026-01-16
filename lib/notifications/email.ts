/**
 * Email notification utilities
 * Supports multiple providers: Zoho (SMTP), Resend, SendGrid, or generic SMTP
 */

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const provider = process.env.EMAIL_PROVIDER || "zoho";

  try {
    switch (provider) {
      case "zoho":
        return await sendViaZoho(options);
      case "resend":
        return await sendViaResend(options);
      case "sendgrid":
        return await sendViaSendGrid(options);
      case "smtp":
        return await sendViaSMTP(options);
      default:
        // Fallback: log email (for development)
        console.log("Email (dev mode):", options);
        return { success: true };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

async function sendViaZoho(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const smtpHost = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
  const smtpPort = parseInt(process.env.ZOHO_SMTP_PORT || "587");
  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPassword = process.env.ZOHO_SMTP_PASSWORD;
  const fromEmail = process.env.ZOHO_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || "arwin@arwindpianist.com";

  if (!smtpUser || !smtpPassword) {
    console.warn("ZOHO_SMTP_USER or ZOHO_SMTP_PASSWORD not set, skipping email");
    return { success: false, error: "Zoho email credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"KVT Jewellers Notifications" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text version
    });

    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("Zoho email error:", error);
    return { success: false, error: error.message || "Failed to send email via Zoho" };
  }
}

async function sendViaResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS || "noreply@kvtjewellers.com";

  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set, skipping email");
    return { success: false, error: "Email API key not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
}

async function sendViaSendGrid(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS || "noreply@kvtjewellers.com";

  if (!apiKey) {
    console.warn("EMAIL_API_KEY not set, skipping email");
    return { success: false, error: "Email API key not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: from },
        subject: options.subject,
        content: [
          { type: "text/html", value: options.html },
          ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      return { success: false, error: "Failed to send email" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send email" };
  }
}

async function sendViaSMTP(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // Support both ZOHO_ prefix and generic SMTP_ prefix
  const smtpHost = process.env.ZOHO_SMTP_HOST || process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.ZOHO_SMTP_PORT || process.env.SMTP_PORT || "587");
  const smtpUser = process.env.ZOHO_SMTP_USER || process.env.SMTP_USER;
  const smtpPassword = process.env.ZOHO_SMTP_PASSWORD || process.env.SMTP_PASSWORD;
  const fromEmail = process.env.ZOHO_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || "noreply@kvtjewellers.com";

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn("SMTP credentials not set, skipping email");
    return { success: false, error: "SMTP credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: `"KVT Jewellers Notifications" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });

    console.log("Email sent:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("SMTP email error:", error);
    return { success: false, error: error.message || "Failed to send email via SMTP" };
  }
}