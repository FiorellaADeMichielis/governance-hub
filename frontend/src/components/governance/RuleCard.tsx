import type { GovernanceRule } from '../../types/governance.types';
import { useTranslation } from '../../i18n/useTranslation';

interface RuleCardProps {
  rule: GovernanceRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isToggling?: boolean;
}

export const RuleCard = ({ rule, onToggle, onDelete, isToggling }: RuleCardProps) => {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    switch (rule.resultingStatus) {
      case 'BLOCKED':
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
      case 'RISKY':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
      case 'UNDER_REVIEW':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30';
    }
  };

  const getRiskBadge = () => {
    switch (rule.resultingRiskLevel) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MEDIUM':
        return 'bg-yellow-500 text-stone-950 font-semibold';
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  const statusLabel = () => {
    switch (rule.resultingStatus) {
      case 'APPROVED': return t('dashboard.statusApproved');
      case 'BLOCKED': return t('dashboard.statusBlocked');
      case 'RISKY': return t('dashboard.statusRisky');
      case 'UNDER_REVIEW': return t('dashboard.statusUnderReview');
      default: return rule.resultingStatus;
    }
  };

  return (
    <div className={`p-5 rounded-xl border transition-all ${
      rule.isActive 
        ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm' 
        : 'bg-stone-50/70 dark:bg-stone-900/40 border-stone-200/60 dark:border-stone-800/40 opacity-70'
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Encabezado y Descripción */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 dark:bg-neutral-900 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              {t('governance.priorityBadge', { priority: rule.priority })}
            </span>
            <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
              {rule.name}
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed mb-3">
            {rule.description}
          </p>

          {/* Condición de la regla */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-stone-50 dark:bg-neutral-900 border border-stone-200/80 dark:border-stone-700 font-mono text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-sans text-[11px]">{t('governance.ifCondition')}</span>
            <span className="px-1.5 py-0.5 rounded bg-white dark:bg-stone-800 text-orange-600 dark:text-orange-400 font-semibold border border-stone-200 dark:border-stone-700">
              {rule.targetField}
            </span>
            <span className="font-bold text-stone-700 dark:text-stone-300">
              [{rule.operator}]
            </span>
            <span className="text-stone-900 dark:text-stone-100 font-semibold truncate max-w-xs" title={rule.expectedValue}>
              "{rule.expectedValue}"
            </span>
          </div>
        </div>

        {/* Acciones y Toggle */}
        <div className="flex flex-col items-end gap-3">
          {/* Switch de activación */}
          <button
            type="button"
            role="switch"
            aria-checked={rule.isActive}
            disabled={isToggling}
            onClick={() => onToggle(rule.id)}
            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              rule.isActive ? 'bg-orange-600' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                rule.isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          {/* Botón Eliminar */}
          <button
            type="button"
            onClick={() => onDelete(rule.id)}
            title={t('governance.deleteRule')}
            className="text-xs text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-neutral-900"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Badges de Resultado */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-700/60 text-xs">
        <span className="text-stone-400 dark:text-stone-500 text-[11px]">{t('governance.resultingAction')}</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge()}`}>
          {statusLabel()}
        </span>
        <span className={`px-1.5 py-0.2 rounded text-[10px] ${getRiskBadge()}`}>
          {rule.resultingRiskLevel}
        </span>
      </div>
    </div>
  );
};

