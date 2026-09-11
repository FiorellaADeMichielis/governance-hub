import { StatusBadge } from './StatusBadge';
import { useTranslation } from '../i18n/useTranslation';

export interface Flow {
  id: string;
  platformId: string;
  departmentId: string;
  status: string;
  riskLevel: string;
  flowName?: string | null;
  author?: string | null;
  observations?: string | null;
}

export interface FlowTableProps {
  flows: Flow[];
  isLoading: boolean;
  onReviewAction: (id: string, action: 'APPROVE' | 'BLOCK' | 'MARK_REVIEW') => void;
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  userRole?: 'ADMIN' | 'USER';
}

export const FlowTable = ({ 
  flows, 
  isLoading, 
  onReviewAction, 
  currentPage, 
  totalPages, 
  onNextPage, 
  onPrevPage, 
  userRole = 'USER',
}: FlowTableProps) => {
  const { t, tDepartment } = useTranslation();
  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm dark:shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 dark:bg-neutral-900 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider transition-colors select-none">
              <th className="p-4 font-semibold min-w-[200px] max-w-[260px]">{t('dashboard.platformColumn')}</th>
              <th className="p-4 font-semibold w-32">{t('dashboard.departmentColumn')}</th>
              <th className="p-4 font-semibold w-36">{t('dashboard.statusColumn')}</th>
              <th className="p-4 font-semibold min-w-[220px]">{t('dashboard.observationsColumn')}</th>
              <th className="p-4 font-semibold text-right w-44 min-w-[170px]">{t('dashboard.actionsColumn')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-700">
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-500 dark:text-stone-400">{t('dashboard.loadingFlows')}</td></tr>
            ) : flows.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-stone-500 dark:text-stone-400">{t('dashboard.emptyFlows')}</td></tr>
            ) : (
              flows.map((flow) => (
                <tr key={flow.id} className="hover:bg-stone-50 dark:hover:bg-neutral-800/60 transition-colors">
                  <td className="p-4 min-w-[200px] max-w-[260px]">
                    <div className="font-semibold text-stone-900 dark:text-stone-50 text-xs truncate" title={flow.flowName || flow.platformId}>
                      {flow.flowName || flow.platformId}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 capitalize mt-0.5 truncate">
                      {flow.platformId} {flow.author ? `• ${flow.author}` : ''}
                    </div>
                  </td>
                  <td className="p-4 text-stone-600 dark:text-stone-400 text-xs capitalize whitespace-nowrap w-32">
                    {tDepartment(flow.departmentId)}
                  </td>
                  <td className="p-4 whitespace-nowrap w-36">
                    <StatusBadge status={flow.status} />
                  </td>
                  <td className="p-4 min-w-[220px]">
                    {isAdmin ? (
                      flow.observations ? (
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed max-w-sm line-clamp-2" title={flow.observations}>
                          {flow.observations}
                        </p>
                      ) : flow.status === 'APPROVED' ? (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          {t('dashboard.noObservations')}
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-500">—</span>
                      )
                    ) : (
                      flow.observations ? (
                        <div className={`p-2.5 rounded-lg text-xs leading-relaxed border ${
                          flow.status === 'BLOCKED'
                            ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-300'
                            : flow.status === 'UNDER_REVIEW' || flow.status === 'RISKY'
                            ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300'
                            : 'bg-stone-50 dark:bg-neutral-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}>
                          <span className="font-semibold block text-[10px] uppercase tracking-wider mb-0.5">
                            {flow.status === 'BLOCKED' ? 'Motivo de Bloqueo:' : 'Observación:'}
                          </span>
                          <span>{flow.observations}</span>
                        </div>
                      ) : flow.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{t('dashboard.noObservations')}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400 dark:text-stone-500">—</span>
                      )
                    )}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap w-44 min-w-[170px]">
                    {isAdmin ? (
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {(flow.status === 'PENDING' || flow.status === 'UNDER_REVIEW') && (
                          <>
                            <button 
                              type="button"
                              onClick={() => onReviewAction(flow.id, 'APPROVE')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/60 transition-colors cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              {t('dashboard.approveAction')}
                            </button>
                            <button 
                              type="button"
                              onClick={() => onReviewAction(flow.id, 'BLOCK')}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 border border-stone-200 hover:border-red-200 dark:border-stone-700 dark:hover:border-red-800/60 transition-colors cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            >
                              {t('dashboard.blockAction')}
                            </button>
                          </>
                        )}

                        {(flow.status === 'APPROVED' || flow.status === 'BLOCKED') && (
                          <button 
                            type="button"
                            onClick={() => onReviewAction(flow.id, 'MARK_REVIEW')}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white hover:bg-amber-50 text-stone-600 hover:text-amber-800 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-amber-950/40 dark:hover:text-amber-300 border border-stone-200 hover:border-amber-200 dark:border-stone-700 dark:hover:border-amber-800/60 transition-colors cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                          >
                            {t('dashboard.reviewAction')}
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-neutral-900 border border-stone-200 dark:border-stone-700/60 select-none">
                        {t('dashboard.readOnlyBadge')}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-neutral-900 transition-colors select-none">
        <span className="text-sm text-stone-600 dark:text-stone-400 tabular-nums">
          {t('dashboard.pageOf', { current: currentPage, total: totalPages || 1 })}
        </span>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={onPrevPage} 
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {t('dashboard.previous')}
          </button>
          <button 
            type="button"
            onClick={onNextPage} 
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-3 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            {t('dashboard.next')}
          </button>
        </div>
      </div>
    </div>
  );
};