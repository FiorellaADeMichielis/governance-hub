import { useEffect, useState } from 'react';
import { FlowTable, type Flow } from '../components/FlowTable';
import { ConfirmationModal } from '../components/ConfirmationModal'; // <-- Importamos el modal

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // ESTADOS DEL MODAL
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    flowId: string;
    action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW' | null;
    platformId: string;
  }>({ isOpen: false, flowId: '', action: null, platformId: '' });

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const query = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (statusFilter) query.append('status', statusFilter);

      try {
        const response = await fetch(`http://localhost:3000/flows?${query.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const json = await response.json();
          setFlows(json.data);
          setTotalPages(json.meta.lastPage);
        } else if (response.status === 401) {
          alert('Sesión expirada.');
          onLogout();
        }
      } catch (error) {
        console.error("Error fetching flows", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlows();
  }, [page, statusFilter, onLogout]);

  // 1. Interceptor de acciones (Abre el modal o aprueba directo)
  const handleReviewRequest = (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => {
    if (action === 'APPROVE') {
      executeAction(id, action, ''); // Aprobar no pide confirmación estricta
    } else {
      const flow = flows.find(f => f.id === id);
      if (flow) {
        setModalConfig({ isOpen: true, flowId: id, action, platformId: flow.platformId });
      }
    }
  };

  // 2. Ejecutor real (Se llama tras confirmar en el modal)
  const executeAction = async (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW', reason: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Ahora enviamos el action Y el reason opcional
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        let newStatus = '';
        if (action === 'APPROVE') newStatus = 'APPROVED';
        else if (action === 'BLOCK') newStatus = 'BLOCKED';
        else if (action === 'MARK_REVIEW') newStatus = 'UNDER_REVIEW';

        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
        setModalConfig(prev => ({ ...prev, isOpen: false })); // Cerramos el modal
      } else {
        const errorData = await response.json();
        alert(`Operación rechazada: ${errorData.message}`);
        setModalConfig(prev => ({ ...prev, isOpen: false }));
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al intentar comunicarse con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Shadow IT Detection</h1>
            <p className="text-slate-500 mt-2">Monitoreo y gobernanza de herramientas no autorizadas.</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-sm text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <select 
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white shadow-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendientes</option>
            <option value="UNDER_REVIEW">En Revisión</option>
            <option value="APPROVED">Aprobados</option>
            <option value="BLOCKED">Bloqueados</option>
          </select>
        </div>
        
        {/* Pasamos handleReviewRequest a la tabla en lugar del execute directo */}
        <FlowTable 
          flows={flows} 
          isLoading={loading} 
          onReviewAction={handleReviewRequest} 
          currentPage={page}
          totalPages={totalPages}
          onNextPage={() => setPage(prev => Math.min(prev + 1, totalPages))}
          onPrevPage={() => setPage(prev => Math.max(prev - 1, 1))}
        />
      </div>

      {/* Renderizamos el modal en la raíz de la página */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(reason) => executeAction(modalConfig.flowId, modalConfig.action!, reason)}
        title={modalConfig.action === 'BLOCK' ? 'Bloquear Integración' : 'Re-evaluar Integración'}
        description={`Estás a punto de ${modalConfig.action === 'BLOCK' ? 'bloquear permanentemente' : 'poner en revisión'} el flujo de la plataforma ${modalConfig.platformId.toUpperCase()}. Esta acción será registrada en el log de auditoría.`}
        expectedText={`${modalConfig.platformId}-confirmar`}
        actionType={modalConfig.action === 'BLOCK' ? 'danger' : 'warning'}
      />
    </div>
  );
};