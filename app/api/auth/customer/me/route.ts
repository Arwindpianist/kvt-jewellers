import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";

/**
 * Get current customer user endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCustomerUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error getting customer user:", error);
    return NextResponse.json({ user: null });
  }
}