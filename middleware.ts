import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Only protect /staff routes
  if (request.nextUrl.pathname.startsWith("/staff")) {
    // Skip login page (it redirects to /login)
    if (request.nextUrl.pathname === "/staff/login") {
      return NextResponse.next();
    }

    // Check for Supabase Auth session token
    // Supabase Auth typically uses cookies like: sb-<project-ref>-auth-token
    // We'll check for any auth-related cookie
    const cookies = request.cookies.getAll();
    const hasAuthCookie = cookies.some(
      cookie => 
        cookie.name.includes('auth-token') || 
        cookie.name.includes('supabase') ||
        cookie.name.startsWith('sb-')
    );

    if (!hasAuthCookie) {
      // Redirect to unified login page
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Additional verification will be done in the page components
    // since middleware has limitations with async operations
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*"],
};
