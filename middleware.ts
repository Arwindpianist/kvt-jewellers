import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Handle staff route protection
  if (pathname.startsWith("/staff")) {
    // Skip login page (it redirects to /login)
    if (pathname === "/staff/login") {
      return NextResponse.next();
    }

    // Check for Supabase Auth session token
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
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For public routes, just pass through
  // Locale detection is handled via cookies in the i18n config
  // No need for next-intl middleware when using localePrefix: 'never'
  return NextResponse.next();
}

export const config = {
  // Match all routes except API, static files, and Next.js internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
