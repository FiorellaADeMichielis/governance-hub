import { StatusBadge } from './StatusBadge';

// La interfaz debe coincidir con los datos
export interface Flow {
  id: string;
  platformId: string;
  departmentId: string;
  status: string;
  riskLevel: string;
}

interface FlowTableProps {
  flows: Flow[];
  isLoading: boolean;
  onReviewAction: (id: string, action: 'APPROVE' | 'BLOCK') => void;
}

export const FlowTable = ({ flows, isLoading, onReviewAction }: FlowTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold">Plataforma</th>
            <th className="p-4 font-semibold">Departamento</th>
            <th className="p-4 font-semibold">Estado</th>
            <th className="p-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr><td colSpan={4} className="p-8 text-center text-slate-500">Cargando flujos...</td></tr>
          ) : flows.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-slate-500">No se encontraron registros.</td></tr>
          ) : (
            flows.map((flow) => (
              <tr key={flow.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800 capitalize">{flow.platformId}</td>
                <td className="p-4 text-slate-600 capitalize">{flow.departmentId}</td>
                <td className="p-4">
                  {/* COMPOSICIÓN: Usamos el Badge visual aquí */}
                  <StatusBadge status={flow.status} />
                </td>
                <td className="p-4 text-right space-x-2">
                  {flow.status === 'PENDING' && (
                    <button 
                      onClick={() => onReviewAction(flow.id, 'APPROVE')}
                      className="px-3 py-1.5 bg-indigo-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                    >
                      Aprobar
                    </button>
                  )}
                  {flow.status !== 'BLOCKED' && (
                    <button 
                      onClick={() => onReviewAction(flow.id, 'BLOCK')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
                    >
                      Bloquear
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};