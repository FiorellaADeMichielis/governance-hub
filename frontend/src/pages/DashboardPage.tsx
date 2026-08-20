import { useEffect, useState } from 'react';
import { FlowTable, type Flow } from '../components/FlowTable';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  //Nuevos estados para paginación y filtros
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const fetchFlows = async () => {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Construye los parámetros de la URL dinámicamente
      const query = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (statusFilter) query.append('status', statusFilter);

      try {
        const response = await fetch(`http://localhost:3000/flows?${query.toString()}`, {
          headers: { 
            // Envia el token para poder leer los flujos
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          const json = await response.json();
          // Adapta la lectura a la nueva estructura paginada { data, meta }
          setFlows(json.data);
          setTotalPages(json.meta.lastPage);
        } else if (response.status === 401) {
          alert('Sesión expirada o inválida. Por favor, vuelve a iniciar sesión.');
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

  const handleReview = async (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        let newStatus = '';
        if (action === 'APPROVE') newStatus = 'APPROVED';
        else if (action === 'BLOCK') newStatus = 'BLOCKED';
        else if (action === 'MARK_REVIEW') newStatus = 'UNDER_REVIEW';

        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      } else {
        if (response.status === 401) {
          alert('Sesión expirada o inválida.');
          onLogout();
          return;
        }
        const errorData = await response.json();
        alert(`Operación rechazada: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al intentar comunicarse con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Shadow IT Detection</h1>
            <p className="text-slate-500 mt-2">Monitoreo y gobernanza de herramientas no autorizadas.</p>
          </div>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm font-medium shadow-sm"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* 4. Controles de Filtro Visuales */}
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
        <FlowTable 
          flows={flows} 
          isLoading={loading} 
          onReviewAction={handleReview} 
          currentPage={page}
          totalPages={totalPages}
          onNextPage={() => setPage(prev => Math.min(prev + 1, totalPages))}
          onPrevPage={() => setPage(prev => Math.max(prev - 1, 1))}
        />
        
      </div>
    </div>
  );
};