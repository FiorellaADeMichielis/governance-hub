import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { FlowTable, type Flow } from '../components/FlowTable';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Sidebar } from '../components/layouts/Sidebar';
import { MetricsCards } from '../components/layouts/MetricsCards';
import { DashboardLayout } from '../components/layouts/DashboardLayout';
import { type UserSession } from '../types/auth.types';

interface DashboardPageProps {
  user: UserSession;
  onLogout: () => void;
}

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  // --- 1. ESTADO ---
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [modalConfig, setModalConfig] = useState<{ 
    isOpen: boolean; 
    flowId: string; 
    action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW' | null; 
    platformId: string; 
  }>({ isOpen: false, flowId: '', action: null, platformId: '' });
  const [isDark, setIsDark] = useState(true);

  // Trigger para forzar recarga por WebSocket
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- 2. LÓGICA DERIVADA ---
  const totalFlows = flows.length;
  const blockedFlows = flows.filter(f => f.status === 'BLOCKED').length;
  const riskyFlows = flows.filter(f => f.status === 'RISKY' || f.status === 'UNDER_REVIEW').length;

  // --- 3. EFECTOS (TEMA Y WEBSOCKETS) ---
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3000'); 

    socket.on('flow_updated', () => {
      console.log('📣 ¡Actualización en tiempo real recibida!');
      setRefreshTrigger(prev => prev + 1); 
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // --- 4. EFECTO FETCH CON JWT ---
  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const query = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (statusFilter) query.append('status', statusFilter);

      try {
        const response = await fetch(`http://localhost:3000/flows?${query.toString()}`, {
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });
        if (response.ok) {
          const json = await response.json();
          setFlows(json.data);
          setTotalPages(json.meta.lastPage);
        } else if (response.status === 401) {
          onLogout();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlows();
  }, [page, statusFilter, onLogout, refreshTrigger]);

  // --- 5. MANEJADORES DE EVENTOS ---
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleReviewRequest = (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => {
    // Verificación RBAC en cliente (ACT-01 / ACT-02)
    if (user.role !== 'ADMIN') {
      alert('Operación restringida: Solo el personal de TI / Seguridad (Admin) puede revisar flujos.');
      return;
    }

    if (action === 'APPROVE') {
      executeAction(id, action, '');
    } else {
      const flow = flows.find(f => f.id === id);
      if (flow) setModalConfig({ isOpen: true, flowId: id, action, platformId: flow.platformId });
    }
  };

  const executeAction = async (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW', reason: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, reason }),
      });
      if (response.ok) {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : action === 'BLOCK' ? 'BLOCKED' : 'UNDER_REVIEW';
        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      } else {
        const errorData = await response.json();
        alert(`Operación rechazada: ${errorData.message}`);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // --- 6. RENDERIZADO COMPUESTO ---
  return (
    <DashboardLayout 
      sidebar={<Sidebar isDark={isDark} toggleTheme={toggleTheme} onLogout={onLogout} user={user} />}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Overview</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Plataforma de Gobernanza y Supervisión de Automatizaciones LCNC
          </p>
        </div>

        {/* Badge indicador de sesión activa */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs">
          <span className="text-stone-500 dark:text-stone-400">Rol activo:</span>
          <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
            user.role === 'ADMIN'
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
          }`}>
            {user.role} ({user.department})
          </span>
        </div>
      </div>
      
      <MetricsCards total={totalFlows} risky={riskyFlows} blocked={blockedFlows} />

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50">Activity / Audit Logs</h3>
        <select 
          className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-50 text-sm rounded-lg focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="UNDER_REVIEW">En Revisión</option>
          <option value="APPROVED">Aprobados</option>
          <option value="BLOCKED">Bloqueados</option>
        </select>
      </div>
      
      <FlowTable 
        flows={flows} 
        isLoading={loading} 
        onReviewAction={handleReviewRequest} 
        currentPage={page}
        totalPages={totalPages}
        onNextPage={() => setPage(prev => Math.min(prev + 1, totalPages))}
        onPrevPage={() => setPage(prev => Math.max(prev - 1, 1))}
        userRole={user.role}
      />

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(reason) => executeAction(modalConfig.flowId, modalConfig.action!, reason)}
        title={modalConfig.action === 'BLOCK' ? 'Bloquear Integración' : 'Re-evaluar Integración'}
        description={`Estás a punto de ${modalConfig.action === 'BLOCK' ? 'bloquear permanentemente' : 'poner en revisión'} el flujo de la plataforma ${modalConfig.platformId.toUpperCase()}.`}
        expectedText={`${modalConfig.platformId}-confirmar`}
        actionType={modalConfig.action === 'BLOCK' ? 'danger' : 'warning'}
      />
    </DashboardLayout>
  );
};