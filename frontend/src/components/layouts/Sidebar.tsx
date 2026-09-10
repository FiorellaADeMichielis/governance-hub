import { type UserSession } from '../../types/auth.types';
import { 
  IconDashboard, 
  IconIntegrations, 
  IconGovernance, 
  IconAuditLogs, 
  IconSun, 
  IconMoon, 
  IconLogout 
} from '../common/Icons';

export type NavSection = 'dashboard' | 'integrations' | 'governance' | 'audit-logs';

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  onLogout: () => void;
  user?: UserSession;
  currentSection?: NavSection;
  onNavigate?: (section: NavSection) => void;
}

export const Sidebar = ({ 
  isDark, 
  toggleTheme, 
  onLogout, 
  user,
  currentSection = 'dashboard',
  onNavigate,
}: SidebarProps) => {
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const isAdmin = user?.role === 'ADMIN';

  const allNavItems: { 
    id: NavSection; 
    label: string; 
    icon: (className?: string) => React.ReactNode; 
    adminOnly: boolean;
  }[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: (cls) => <IconDashboard className={cls} />, 
      adminOnly: false 
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      icon: (cls) => <IconIntegrations className={cls} />, 
      adminOnly: true 
    },
    { 
      id: 'governance', 
      label: 'Governance', 
      icon: (cls) => <IconGovernance className={cls} />, 
      adminOnly: true 
    },
    { 
      id: 'audit-logs', 
      label: 'Audit Logs', 
      icon: (cls) => <IconAuditLogs className={cls} />, 
      adminOnly: true 
    },
  ];

  // Restricción RBAC: usuarios no-admin únicamente ven las secciones que les conciernen (Dashboard)
  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  const navItemBase = "w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors";
  const navItemActive = "bg-orange-50 text-orange-700 dark:bg-neutral-900 dark:text-orange-400 font-semibold";
  const navItemInactive = "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-neutral-900";

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
        {navItems.map((item) => {
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate?.(item.id)}
              className={`${navItemBase} ${isActive ? navItemActive : navItemInactive}`}
            >
              {item.icon(isActive ? 'w-4 h-4 text-orange-600 dark:text-orange-400' : 'w-4 h-4 text-stone-500 dark:text-stone-400')}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Widget de usuario logueado con RBAC */}
      {user && (
        <div className="p-4 mx-3 mb-2 bg-stone-50 dark:bg-neutral-900/70 border border-stone-200 dark:border-stone-700/60 rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
              isAdmin 
                ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800' 
                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            }`}>
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-stone-900 dark:text-stone-200 truncate" title={user.email}>
                {user.email}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' 
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}>
                  {user.role}
                </span>
                {user.department && (
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 truncate">
                    {user.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-stone-200 dark:border-stone-700 space-y-2">
        <button 
          onClick={toggleTheme} 
          className="w-full px-3 py-2 text-sm font-medium flex items-center justify-between text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
        >
          <span className="flex items-center gap-2">
            {isDark ? <IconSun className="w-4 h-4 text-amber-500" /> : <IconMoon className="w-4 h-4 text-stone-400" />}
            <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </span>
        </button>
        <button 
          onClick={onLogout} 
          className="w-full px-3 py-2 text-sm font-medium flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-neutral-900 rounded-lg transition-colors text-left"
        >
          <IconLogout className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};