import { NextRequest, NextResponse } from "next/server";
import { createStaffUser } from "@/lib/auth/staff";
import { verifyStaffAuth } from "@/lib/auth";

/**
 * Create staff/admin user endpoint (admin only)
 * This is for seeding initial admin users
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const session = await verifyStaffAuth(request);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { getStaffUser } = await import("@/lib/auth/staff");
    const staffUser = await getStaffUser();
    
    if (!staffUser || staffUser.role !== 'admin') {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name, role = 'staff' } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'staff') {
      return NextResponse.json(
        { error: "Role must be 'admin' or 'staff'" },
        { status: 400 }
      );
    }

    const { user, error } = await createStaffUser(email, password, name, role as 'admin' | 'staff');

    if (error || !user) {
      return NextResponse.json(
        { error: error || "Failed to create user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      message: `Staff user created successfully. Password: ${password}`,
    });
  } catch (error) {
    console.error("Error creating staff user:", error);
    return NextResponse.json(
      { error: "Failed to create staff user" },
      { status: 500 }
    );
  }
}
