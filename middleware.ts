import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect /staff routes
  if (request.nextUrl.pathname.startsWith("/staff")) {
    // Skip login page
    if (request.nextUrl.pathname === "/staff/login") {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get("kvt-staff-session");
    
    if (!sessionCookie) {
      // Redirect to login
      const loginUrl = new URL("/staff/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verify session is valid (basic check)
    try {
      const session = JSON.parse(sessionCookie.value);
      if (new Date(session.expiresAt) < new Date()) {
        // Session expired, redirect to login
        const loginUrl = new URL("/staff/login", request.url);
        loginUrl.searchParams.set("from", request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // Invalid session, redirect to login
      const loginUrl = new URL("/staff/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};

