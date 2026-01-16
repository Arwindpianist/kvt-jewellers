import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/auth/customer";

/**
 * Request password reset endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { error } = await requestPasswordReset(email);

    if (error) {
      return NextResponse.json(
        { error },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email has been sent.",
    });
  } catch (error) {
    console.error("Error in password reset request:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}