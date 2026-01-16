export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'admin' | 'staff' | 'customer';
}

export interface Session {
  user: User;
  expiresAt: Date;
}

