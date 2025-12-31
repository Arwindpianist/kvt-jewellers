export type UserRole = "admin" | "staff";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Session {
  user: User;
  expiresAt: Date;
}

