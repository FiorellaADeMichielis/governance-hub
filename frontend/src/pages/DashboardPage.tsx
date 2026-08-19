import { useEffect, useState } from 'react';
import { FlowTable, type Flow } from '../components/FlowTable';

interface DashboardPageProps {
  onLogout: () => void;
}

export const DashboardPage = ({ onLogout }: DashboardPageProps) => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/flows')
      .then((res) => res.json())
      .then((data) => {
        setFlows(data);
        setLoading(false);
      });
  }, []);

  // 1. Agregamos MARK_REVIEW a los tipos permitidos
  const handleReview = async (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => {
    try {
      // 2. Buscamos nuestro "pasaporte" en la memoria del navegador
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          // 3. Enviamos el token al guardia de seguridad de NestJS
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // 4. Mapeamos la acción al nuevo estado
        let newStatus = '';
        if (action === 'APPROVE') newStatus = 'APPROVED';
        else if (action === 'BLOCK') newStatus = 'BLOCKED';
        else if (action === 'MARK_REVIEW') newStatus = 'UNDER_REVIEW';

        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      } else {
        // 5. Manejo de seguridad: Si el token es inválido o expiró
        if (response.status === 401) {
          alert('Sesión expirada o inválida. Por favor, vuelve a iniciar sesión.');
          onLogout(); // Echamos al usuario a la pantalla de Login
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
        
        {/* Cabecera con botón de Logout */}
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
        
        <FlowTable 
          flows={flows} 
          isLoading={loading} 
          onReviewAction={handleReview} 
        />
      </div>
    </div>
  );
};