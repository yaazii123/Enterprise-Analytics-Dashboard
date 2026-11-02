export type Role = 'admin' | 'manager' | 'analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
  title: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: number;
}
