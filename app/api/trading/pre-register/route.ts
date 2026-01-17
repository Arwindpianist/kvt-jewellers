import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email";
import { getBrandedEmailTemplate } from "@/lib/notifications/email-templates";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";

/**
 * Pre-registration endpoint for online trading platform
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country } = body;

    if (!name || !email || !phone || !country) {
      return NextResponse.json(
        { error: "Name, email, phone, and country are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Check if already pre-registered
    const { data: existing } = await supabase
      .from("trading_pre_registrations")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "This email is already pre-registered" },
        { status: 400 }
      );
    }

    // Insert pre-registration
    type TradingPreRegistrationInsert = Database["public"]["Tables"]["trading_pre_registrations"]["Insert"];
    
    const { data: registration, error: insertError } = await supabase
      .from("trading_pre_registrations")
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        country: country.trim(),
        status: "pending" as const,
      } satisfies TradingPreRegistrationInsert)
      .select()
      .single();

    if (insertError) {
      logger.error("Error creating pre-registration:", insertError);
      return NextResponse.json(
        { error: "Failed to create pre-registration" },
        { status: 500 }
      );
    }

    // Send confirmation email (don't fail if email fails)
    try {
      const emailHtml = getBrandedEmailTemplate({
        title: "Pre-Registration Confirmed",
        greeting: `Hello ${name},`,
        content: `
          <p>Thank you for pre-registering for our Online Trading Platform!</p>
          <p>We're excited to have you on board. You'll be among the first to know when we launch our revolutionary platform for trading gold and silver.</p>
          <p><strong>What's next?</strong></p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>You'll receive an exclusive launch notification when the platform goes live</li>
            <li>Early access details and special offers reserved for pre-registered users</li>
            <li>Regular updates on platform development and features</li>
          </ul>
          <p>We're working hard to bring you an exceptional trading experience. Stay tuned!</p>
        `,
        footerText: "If you have any questions, feel free to reach out to our support team.",
      });

      await sendEmail({
        to: email,
        subject: "Pre-Registration Confirmed - KVT Jewellers Online Trading",
        html: emailHtml,
      });
    } catch (emailError) {
      // Log email error but don't fail the registration
      logger.error("Failed to send pre-registration confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Pre-registration successful",
    });
  } catch (error) {
    logger.error("Error in pre-registration:", error);
    return NextResponse.json(
      { error: "Pre-registration failed" },
      { status: 500 }
    );
  }
}
