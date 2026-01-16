import { NextRequest } from "next/server";
import { getStaffUser } from "./auth/staff";
import type { StaffUser } from "./auth/staff";
import type { Session, User } from "@/types/auth";

// For backward compatibility, we'll use Supabase Auth session
// The session is managed by Supabase Auth cookies, not custom cookies

/**
 * Verifies staff authentication from request (uses Supabase Auth)
 */
export async function verifyStaffAuth(request: NextRequest): Promise<Session | null> {
  const user = await getStaffUser();
  
  if (!user) {
    return null;
  }

  // Session expiration is handled by Supabase Auth
  // We just need to verify the user exists and has staff/admin role
  return {
    user: user as User,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours (approximate)
  };
}

/**
 * Gets current session (server component) - uses Supabase Auth
 */
export async function getSession(): Promise<Session | null> {
  const user = await getStaffUser();
  
  if (!user) {
    return null;
  }

  return {
    user: user as User,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours (approximate)
  };
}

/**
 * @deprecated Use signInStaff from lib/auth/staff.ts instead
 * This function is kept for backward compatibility
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  const { signInStaff } = await import("./auth/staff");
  const { user, error } = await signInStaff(email, password);
  
  if (error || !user) {
    return null;
  }
  
  return user as User;
}

/**
 * @deprecated Sessions are now managed by Supabase Auth
 * This function is kept for backward compatibility but does nothing
 */
export async function createSession(user: User | StaffUser): Promise<string> {
  // Session is created automatically by Supabase Auth on sign in
  return typeof user === 'string' ? user : user.id;
}

/**
 * @deprecated Use signOutStaff from lib/auth/staff.ts instead
 * This function is kept for backward compatibility
 */
export async function destroySession(): Promise<void> {
  const { signOutStaff } = await import("./auth/staff");
  await signOutStaff();
}
