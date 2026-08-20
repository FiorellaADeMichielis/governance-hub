import {type ReactNode } from 'react';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const DashboardLayout = ({ sidebar, children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-neutral-900 text-stone-900 dark:text-stone-50 flex font-sans transition-colors duration-200">
      {/* Inyecta los el Sidebar aquí */}
      {sidebar}
      
      {/* Área Principal de Contenido */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};