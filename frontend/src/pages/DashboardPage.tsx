import { useEffect, useState } from 'react';
import { FlowTable, type Flow } from '../components/FlowTable';

export const DashboardPage = () => {
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

  const handleReview = async (id: string, action: 'APPROVE' | 'BLOCK') => {
    try {
      const response = await fetch(`http://localhost:3000/flows/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const newStatus = action === 'APPROVE' ? 'APPROVED' : 'BLOCKED';
        setFlows(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
      } else {
        const errorData = await response.json();
        alert(`Operación rechazada: ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Shadow IT Detection</h1>
          <p className="text-slate-500 mt-2">Monitoreo y gobernanza de herramientas no autorizadas.</p>
        </div>
        
        {/* Dumb Component inyectándole los datos y la lógica */}
        <FlowTable 
          flows={flows} 
          isLoading={loading} 
          onReviewAction={handleReview} 
        />
      </div>
    </div>
  );
};