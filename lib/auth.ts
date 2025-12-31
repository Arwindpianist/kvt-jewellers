import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import type { User, Session } from "@/types/auth";

// Mock user database (in production, use real database)
const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "admin@kvtjewellers.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "staff@kvtjewellers.com",
    name: "Staff User",
    role: "staff",
  },
];

const SESSION_COOKIE_NAME = "kvt-staff-session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Creates a session for a user
 */
export async function createSession(user: User): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  // In production, store session in database
  // For now, we'll encode user info in the session (not secure, but works for mock)
  const sessionData: Session = {
    user,
    expiresAt,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return sessionId;
}

/**
 * Verifies staff authentication from request
 */
export async function verifyStaffAuth(request: NextRequest): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Gets current session (server component)
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  try {
    const session: Session = JSON.parse(sessionCookie.value);

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Authenticates a user with email/password (mock)
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User | null> {
  // Mock authentication - in production, verify password hash
  const user = MOCK_USERS.find((u) => u.email === email);

  if (!user) {
    return null;
  }

  // Mock password check (accept any password for mock users)
  // In production: await bcrypt.compare(password, user.passwordHash)
  if (password === "password" || password === "admin") {
    return user;
  }

  return null;
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

