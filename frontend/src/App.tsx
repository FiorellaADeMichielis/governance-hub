import { useState, useEffect } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { AuthService } from './services/auth.service';
import { LanguageProvider } from './i18n/LanguageContext';
import type { UserSession } from './types/auth.types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const { token, user: storedUser } = AuthService.getStoredSession();
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLoginSuccess = (userData: UserSession) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    AuthService.clearSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex items-center justify-center text-stone-500 dark:text-stone-400 text-sm">
        Cargando Governance Hub...
      </div>
    );
  }

  return (
    <LanguageProvider>
      <div>
        {isAuthenticated && user ? (
          <DashboardPage user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </LanguageProvider>
  );
};

export default App;