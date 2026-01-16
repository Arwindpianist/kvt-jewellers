import { NextRequest, NextResponse } from "next/server";
import { signOutCustomer } from "@/lib/auth/customer";

/**
 * Customer logout endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const { error } = await signOutCustomer();

    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in customer logout:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}