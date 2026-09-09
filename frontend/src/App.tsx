import { useState, useEffect } from 'react';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
  };

  if (isChecking) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div>
      {isAuthenticated ? (
        <DashboardPage onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </div>
  );
}

export default App;