import { useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { type Flow } from '../FlowTable';
import { IconSearch } from '../common/Icons';
import { useTranslation } from '../../i18n/useTranslation';

interface AuditLogsViewProps {
  flows: Flow[];
  isLoading: boolean;
}

export const AuditLogsView = ({ flows, isLoading }: AuditLogsViewProps) => {
  const { t, tDepartment } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredFlows = flows.filter((f) => {
    const matchesSearch =
      f.platformId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.departmentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? f.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
            {t('auditLogs.title')}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {t('auditLogs.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400">
          <span>{t('auditLogs.totalRecords')}</span>
          <span className="font-bold text-stone-900 dark:text-stone-50">{flows.length}</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-2.5 text-stone-400 pointer-events-none">
            <IconSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder={t('auditLogs.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:border-orange-500 transition-colors cursor-pointer"
        >
          <option value="" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('auditLogs.allStatuses')}</option>
          <option value="APPROVED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.approved')}</option>
          <option value="UNDER_REVIEW" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.underReview')}</option>
          <option value="RISKY" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.risky')}</option>
          <option value="BLOCKED" className="bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100">{t('dashboard.blocked')}</option>
        </select>
      </div>

      {/* Tabla de Auditoría */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-100 dark:bg-neutral-900 border-b border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold">{t('auditLogs.colEventId')}</th>
              <th className="p-4 font-semibold">{t('auditLogs.colPlatform')}</th>
              <th className="p-4 font-semibold">{t('auditLogs.colDepartment')}</th>
              <th className="p-4 font-semibold">{t('auditLogs.colEvaluation')}</th>
              <th className="p-4 font-semibold">{t('auditLogs.colRisk')}</th>
              <th className="p-4 font-semibold text-right">{t('auditLogs.colMechanism')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-stone-700 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500 dark:text-stone-400">
                  {t('auditLogs.loadingTraces')}
                </td>
              </tr>
            ) : filteredFlows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-stone-500 dark:text-stone-400">
                  {t('auditLogs.emptySearch')}
                </td>
              </tr>
            ) : (
              filteredFlows.map((flow) => (
                <tr key={flow.id} className="hover:bg-stone-50 dark:hover:bg-neutral-800 transition-colors">
                  <td className="p-4 font-mono text-stone-500 dark:text-stone-400 truncate max-w-35">
                    {flow.id}
                  </td>
                  <td className="p-4 font-medium text-stone-900 dark:text-stone-100 capitalize">
                    {flow.platformId}
                  </td>
                  <td className="p-4 text-stone-600 dark:text-stone-300 capitalize">
                    {tDepartment(flow.departmentId)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={flow.status} />
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        flow.riskLevel === 'CRITICAL' || flow.riskLevel === 'HIGH'
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          : flow.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      }`}
                    >
                      {flow.riskLevel || 'LOW'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                      {t('auditLogs.mechanismValue')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

