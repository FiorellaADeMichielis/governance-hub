export type UserRole = 'ADMIN' | 'USER';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  department: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserSession;
}

