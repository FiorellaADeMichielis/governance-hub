import { type ReactNode } from 'react';

interface DashboardLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export const DashboardLayout = ({ sidebar, children }: DashboardLayoutProps) => {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-100 dark:bg-neutral-900 text-stone-900 dark:text-stone-50 font-sans transition-colors duration-200">
      {/* Sidebar fijo / sticky */}
      {sidebar}
      
      {/* Área Principal de Contenido con scroll independiente */}
      <main className="flex-1 h-full overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};