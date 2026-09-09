import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
  title?: string;
  subtitle?: string;
}

export const AuthLayout = ({
  children,
  isDark,
  onToggleTheme,
  title = 'GOVERNANCE HUB',
  subtitle = 'Control y Gobernanza de Integraciones LCNC',
}: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 transition-colors relative">
      {/* Botón de alternar tema */}
      <div className="absolute top-6 right-6">
        <button
          onClick={onToggleTheme}
          type="button"
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="px-3.5 py-1.5 text-xs font-medium bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-colors">
        {/* Cabecera institucional */}
        <header className="bg-stone-900 dark:bg-neutral-900 p-8 text-center border-b border-stone-800">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-600 text-white font-bold text-xl mb-3 shadow-lg shadow-orange-600/30">
            GH
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-stone-400 mt-1.5 text-xs font-medium tracking-wide uppercase">
            {subtitle}
          </p>
        </header>

        {/* Slot de contenido (Formulario) */}
        <main className="p-8">
          {children}
        </main>
      </div>

      {/* Pie de página de seguridad */}
      <footer className="mt-6 text-center text-xs text-stone-500 dark:text-stone-500">
        <p>Autenticación centralizada con RBAC y políticas de seguridad Zero Trust</p>
      </footer>
    </div>
  );
};
