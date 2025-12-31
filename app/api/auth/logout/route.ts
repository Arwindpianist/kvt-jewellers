import { NextRequest, NextResponse } from "next/server";
import { destroySession, verifyStaffAuth } from "@/lib/auth";

/**
 * Staff logout endpoint
 */
export async function POST(request: NextRequest) {
  const session = await verifyStaffAuth(request);
  
  if (session) {
    await destroySession();
  }

  return NextResponse.json({ success: true });
}

