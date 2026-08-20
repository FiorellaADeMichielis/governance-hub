interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
}

export const Sidebar = ({ isDark, toggleTheme, onLogout }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white dark:bg-stone-800 border-r border-stone-200 dark:border-stone-700 flex flex-col transition-colors">
      <div className="p-6 border-b border-stone-200 dark:border-stone-700">
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-50">GOVERNANCE HUB</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-green-600"></span>
          <span className="text-xs text-stone-500 dark:text-stone-400">System Healthy</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <a href="#" className="block px-3 py-2 text-sm font-medium bg-orange-50 text-orange-700 dark:bg-neutral-900 dark:text-orange-400 rounded-lg transition-colors">Dashboard</a>
        <a href="#" className="block px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-900 hover:text-stone-900 dark:hover:text-stone-50 rounded-lg transition-colors">Integrations</a>
        <a href="#" className="block px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-900 hover:text-stone-900 dark:hover:text-stone-50 rounded-lg transition-colors">Governance</a>
        <a href="#" className="block px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-900 hover:text-stone-900 dark:hover:text-stone-50 rounded-lg transition-colors">Audit Logs</a>
      </nav>
      <div className="p-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
        <button 
          onClick={toggleTheme} 
          className="w-full px-3 py-2 text-sm font-medium flex items-center justify-between text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
        >
          {isDark ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
        <button 
          onClick={onLogout} 
          className="w-full px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-neutral-900 hover:text-red-600 dark:hover:text-red-500 rounded-lg transition-colors text-left"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};