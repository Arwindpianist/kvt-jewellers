import { NextRequest, NextResponse } from "next/server";
import { signOutStaff } from "@/lib/auth/staff";

/**
 * Staff logout endpoint - uses Supabase Auth
 */
export async function POST(request: NextRequest) {
  try {
    await signOutStaff();

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
