/**
 * WhatsApp notification utilities
 * Supports Twilio WhatsApp API
 */

interface WhatsAppOptions {
  to: string;
  message: string;
}

export async function sendWhatsApp(options: WhatsAppOptions): Promise<{ success: boolean; error?: string }> {
  const provider = process.env.WHATSAPP_PROVIDER || "twilio";

  try {
    switch (provider) {
      case "twilio":
        return await sendViaTwilio(options);
      default:
        // Fallback: log message (for development)
        console.log("WhatsApp (dev mode):", options);
        return { success: true };
    }
  } catch (error) {
    console.error("Error sending WhatsApp:", error);
    return { success: false, error: "Failed to send WhatsApp message" };
  }
}

async function sendViaTwilio(options: WhatsAppOptions): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM || process.env.WHATSAPP_PHONE_NUMBER;

  if (!accountSid || !authToken) {
    console.warn("Twilio credentials not set, skipping WhatsApp");
    return { success: false, error: "WhatsApp API credentials not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: from?.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
          To: options.to.startsWith("whatsapp:") ? options.to : `whatsapp:${options.to}`,
          Body: options.message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to send WhatsApp" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to send WhatsApp message" };
  }
}