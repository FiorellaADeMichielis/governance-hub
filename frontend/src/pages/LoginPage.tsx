import { useState, useEffect } from 'react';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';
import { AuthService } from '../services/auth.service';
import type { UserSession, LoginCredentials } from '../types/auth.types';

export type { UserSession };

interface LoginPageProps {
  onLoginSuccess: (user: UserSession) => void;
}

/**
 * Smart Component (Container):
 * Orquesta la autenticación delegando la vista a AuthLayout y LoginForm,
 * y la comunicación de red a AuthService.
 */
export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [isDark, setIsDark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    if (nextDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const authData = await AuthService.login(credentials);
      onLoginSuccess(authData.user);
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Error inesperado al conectar con el servidor';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout isDark={isDark} onToggleTheme={handleToggleTheme}>
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        errorMessage={errorMessage}
      />
    </AuthLayout>
  );
};