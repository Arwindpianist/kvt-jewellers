import { NextRequest, NextResponse } from "next/server";
import { getCustomerUser } from "@/lib/auth/customer";
import { createClient } from "@/lib/supabase/server";

/**
 * Update customer account endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCustomerUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('users')
      .update({ name: name.trim() })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}