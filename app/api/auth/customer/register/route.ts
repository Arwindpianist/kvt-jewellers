import { NextRequest, NextResponse } from "next/server";
import { registerCustomer } from "@/lib/auth/customer";

/**
 * Customer registration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name,
      phone,
      country,
      idType,
      idNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode
    } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check for at least one number and one letter
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    if (!hasNumber || !hasLetter) {
      return NextResponse.json(
        { error: "Password must contain at least one letter and one number" },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required for order notifications" },
        { status: 400 }
      );
    }

    if (!country || !country.trim()) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    if (!idType || !idType.trim()) {
      return NextResponse.json(
        { error: "ID type is required" },
        { status: 400 }
      );
    }

    if (!idNumber || !idNumber.trim()) {
      return NextResponse.json(
        { error: `${idType === "IC" ? "IC number" : "Passport number"} is required` },
        { status: 400 }
      );
    }

    const result = await registerCustomer({
      email,
      password,
      name,
      phone: phone.trim(),
      country: country.trim(),
      idType: idType.trim(),
      idNumber: idNumber.trim().toUpperCase(),
      addressLine1: addressLine1?.trim() || null,
      addressLine2: addressLine2?.trim() || null,
      city: city?.trim() || null,
      state: state?.trim() || null,
      postalCode: postalCode?.trim() || null,
    });

    if (result.error || !result.user) {
      return NextResponse.json(
        { error: result.error || "Registration failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      requiresEmailConfirmation: result.requiresEmailConfirmation || false,
    });
  } catch (error) {
    console.error("Error in customer registration:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}