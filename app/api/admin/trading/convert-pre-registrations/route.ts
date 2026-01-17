import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notifications/email";
import { getBrandedEmailTemplate } from "@/lib/notifications/email-templates";
import { logger } from "@/lib/logger";
import type { Database } from "@/types/database";

/**
 * Convert all pending pre-registrations to registered members and send launch notifications (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Fetch all pending pre-registrations
    type TradingPreRegistrationRow = Database["public"]["Tables"]["trading_pre_registrations"]["Row"];
    
    const { data: pendingRegs, error: fetchError } = await supabase
      .from("trading_pre_registrations")
      .select("*")
      .eq("status", "pending");

    if (fetchError) {
      logger.error("Error fetching pending registrations:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch pending registrations" },
        { status: 500 }
      );
    }

    if (!pendingRegs || pendingRegs.length === 0) {
      return NextResponse.json({
        converted: 0,
        message: "No pending pre-registrations to convert",
      });
    }

    // Update status to converted
    const ids = pendingRegs.map((r) => r.id);
    const { error: updateError } = await supabase
      .from("trading_pre_registrations")
      .update({ status: "converted" })
      .in("id", ids);

    if (updateError) {
      logger.error("Error updating registrations:", updateError);
      return NextResponse.json(
        { error: "Failed to update registrations" },
        { status: 500 }
      );
    }

    // Send launch notification emails to all converted registrations
    const emailPromises = pendingRegs.map((reg: TradingPreRegistrationRow) => {
      const emailHtml = getBrandedEmailTemplate({
        title: "Online Trading Platform is Now Live!",
        greeting: `Hello ${reg.name},`,
        content: `
          <p>Great news! Our Online Trading Platform is now live, and you're all set to start trading!</p>
          <p>As a pre-registered member, your account has been automatically activated. You can now:</p>
          <ul style="margin: 15px 0; padding-left: 20px;">
            <li>Start trading gold and silver at live market rates</li>
            <li>Access your secure trading wallet</li>
            <li>View real-time price charts and analytics</li>
            <li>Execute trades instantly with 24/7 market access</li>
          </ul>
          <p><strong>Get Started:</strong></p>
          <p>Log in to your account to access the trading platform and start your first trade today!</p>
        `,
        buttonText: "Go to Trading Platform",
        buttonUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/trading`,
        footerText: "Welcome to the future of precious metals trading!",
      });

      return sendEmail({
        to: reg.email,
        subject: "🎉 Online Trading Platform is Now Live! - KVT Jewellers",
        html: emailHtml,
      });
    });

    // Send all emails (don't fail if some fail)
    const emailResults = await Promise.allSettled(emailPromises);
    const failedEmails = emailResults.filter((r) => r.status === 'rejected').length;

    if (failedEmails > 0) {
      logger.warn(`${failedEmails} email(s) failed to send`);
    }

    return NextResponse.json({
      converted: pendingRegs.length,
      emailsSent: pendingRegs.length - failedEmails,
      emailsFailed: failedEmails,
      message: `Successfully converted ${pendingRegs.length} pre-registration(s) to registered members`,
    });
  } catch (error) {
    logger.error("Error in convert pre-registrations:", error);
    return NextResponse.json(
      { error: "Failed to convert pre-registrations" },
      { status: 500 }
    );
  }
}
