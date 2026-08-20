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

export const FlowTable = ({ flows, isLoading, onReviewAction, currentPage, totalPages, onNextPage, onPrevPage }: FlowTableProps) => {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm dark:shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-stone-100 dark:bg-neutral-900 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider transition-colors">
            <th className="p-4 font-semibold">Plataforma</th>
            <th className="p-4 font-semibold">Departamento</th>
            <th className="p-4 font-semibold">Estado</th>
            <th className="p-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
          {isLoading ? (
            <tr><td colSpan={4} className="p-8 text-center text-stone-500 dark:text-stone-400">Cargando flujos...</td></tr>
          ) : flows.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-stone-500 dark:text-stone-400">No se encontraron registros.</td></tr>
          ) : (
            flows.map((flow) => (
              <tr key={flow.id} className="hover:bg-stone-50 dark:hover:bg-neutral-800 transition-colors">
                <td className="p-4 font-medium text-stone-900 dark:text-stone-50 capitalize">{flow.platformId}</td>
                <td className="p-4 text-stone-600 dark:text-stone-400 capitalize">{flow.departmentId}</td>
                <td className="p-4"><StatusBadge status={flow.status} /></td>
                <td className="p-4 text-right space-x-2">
                  
                  {(flow.status === 'PENDING' || flow.status === 'UNDER_REVIEW') && (
                    <>
                      <button 
                        onClick={() => onReviewAction(flow.id, 'APPROVE')}
                        className="px-3 py-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 border dark:border-green-500/20 text-xs font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                      >
                        Aprobar
                      </button>
                      <button 
                        onClick={() => onReviewAction(flow.id, 'BLOCK')}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 border dark:border-red-500/20 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                      >
                        Bloquear
                      </button>
                    </>
                  )}

                  {(flow.status === 'APPROVED' || flow.status === 'BLOCKED') && (
                    <button 
                      onClick={() => onReviewAction(flow.id, 'MARK_REVIEW')}
                      className="px-3 py-1.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 border dark:border-orange-500/20 text-xs font-semibold rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
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
      <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-900 transition-colors">
        <span className="text-sm text-stone-600 dark:text-stone-400">
          Página <span className="font-medium text-stone-900 dark:text-stone-50">{currentPage}</span> de <span className="font-medium text-stone-900 dark:text-stone-50">{totalPages || 1}</span>
        </span>
        <div className="flex gap-2">
          <button 
            onClick={onPrevPage} 
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button 
            onClick={onNextPage} 
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};