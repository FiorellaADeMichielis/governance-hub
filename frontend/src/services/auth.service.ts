import type { LoginCredentials, AuthResponse, UserSession } from '../types/auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class AuthService {
  private static readonly TOKEN_KEY = 'accessToken';
  private static readonly USER_KEY = 'user';

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      let errorMessage = 'Error al iniciar sesión';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback al status text si no hay JSON
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: AuthResponse = await response.json();
    this.saveSession(data.accessToken, data.user);
    return data;
  }

  static saveSession(token: string, user: UserSession): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getStoredSession(): { token: string | null; user: UserSession | null } {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userJson = localStorage.getItem(this.USER_KEY);

    let user: UserSession | null = null;
    if (userJson) {
      try {
        user = JSON.parse(userJson) as UserSession;
      } catch {
        this.clearSession();
        return { token: null, user: null };
      }
    }

    return { token, user };
  }

  static clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}

