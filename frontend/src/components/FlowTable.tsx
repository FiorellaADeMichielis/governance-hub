import { StatusBadge } from './StatusBadge';

export interface Flow {
  id: string;
  platformId: string;
  departmentId: string;
  status: string;
  riskLevel: string;
}

export interface FlowTableProps {
  flows: Flow[];
  isLoading: boolean;
  onReviewAction: (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

export const FlowTable = ({ 
  flows, 
  isLoading, 
  onReviewAction,
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage
}: FlowTableProps) => {
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
                  
                  {/* Regla 1: Si está PENDING o UNDER_REVIEW, se puede Aprobar o Bloquear */}
                  {(flow.status === 'PENDING' || flow.status === 'UNDER_REVIEW') && (
                    <>
                      <button 
                        onClick={() => onReviewAction(flow.id, 'APPROVE')}
                        className="px-3 py-1.5 bg-indigo-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => onReviewAction(flow.id, 'BLOCK')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Bloquear
                      </button>
                    </>
                  )}

                  {/* Regla Unificada: Si está Aprobado o Bloqueado, se puede mandar a revisión */}
                  {(flow.status === 'APPROVED' || flow.status === 'BLOCKED') && (
                    <button 
                      onClick={() => onReviewAction(flow.id, 'MARK_REVIEW')}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                    >
                      Poner en Revisión
                    </button>
                  )}
                  
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-600">
          Página <span className="font-medium text-slate-900">{currentPage}</span> de <span className="font-medium text-slate-900">{totalPages || 1}</span>
        </span>
        <div className="flex gap-2">
          <button 
            onClick={onPrevPage} 
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700 transition-colors"
          >
            Anterior
          </button>
          <button 
            onClick={onNextPage} 
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};