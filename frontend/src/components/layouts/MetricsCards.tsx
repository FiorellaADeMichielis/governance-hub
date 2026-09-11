import { useTranslation } from '../../i18n/useTranslation';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';
import { 
  IconShieldCheck, 
  IconWarning, 
  IconBlocks, 
  IconCheck 
} from '../common/Icons';

interface MetricsCardsProps {
  total: number;
  risky: number;
  blocked: number;
  approved?: number;
  pending?: number;
  onSelectFilter?: (status: string) => void;
}

export const MetricsCards = ({ 
  total, 
  risky, 
  blocked, 
  approved = 0, 
  pending = 0,
  onSelectFilter 
}: MetricsCardsProps) => {
  const { t } = useTranslation();

  // Cálculo preciso de tasa de conformidad
  const safeCount = Math.max(total - blocked, 0);
  const rawComplianceScore = total > 0 ? (safeCount / total) * 100 : 100;
  const complianceScore = Math.round(rawComplianceScore * 10) / 10;

  // Contadores animados fluidos
  const animatedScore = useAnimatedCounter(complianceScore, { duration: 650, decimals: 1 });
  const animatedRisky = useAnimatedCounter(risky, { duration: 500 });
  const animatedBlocked = useAnimatedCounter(blocked, { duration: 500 });
  const animatedTotal = useAnimatedCounter(total, { duration: 600 });

  // Porcentajes para la barra de distribución segmentada
  const approvedPct = total > 0 ? (approved / total) * 100 : 0;
  const riskyPct = total > 0 ? (risky / total) * 100 : 0;
  const blockedPct = total > 0 ? (blocked / total) * 100 : 0;
  const pendingPct = total > 0 ? Math.max(100 - approvedPct - riskyPct - blockedPct, 0) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
      {/* Tarjeta Principal Asimétrica: Índice de Conformidad y Cobertura */}
      <div className="lg:col-span-7 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-50">
                {t('dashboard.complianceRateTitle')}
              </h3>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border select-none ${
              complianceScore >= 80
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
            }`}>
              {complianceScore >= 80 ? 'Conformidad Alta' : 'Supervisión Requerida'}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {t('dashboard.complianceRateDesc')}
          </p>
        </div>

        {/* Métrica principal con desglose numérico */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight tabular-nums text-stone-900 dark:text-stone-50 font-mono">
              {animatedScore.toFixed(1)}%
            </span>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Score Global
            </span>
          </div>

          <div className="text-xs text-stone-600 dark:text-stone-400 font-mono tabular-nums">
            <span className="font-bold text-stone-900 dark:text-stone-100">{safeCount}</span>
            <span> / {animatedTotal} seguros</span>
          </div>
        </div>

        {/* Barra de Distribución Segmentada Personalizada */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400">
            <span>{t('dashboard.statusBreakdown')}</span>
            <span className="font-mono">{total} activos</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-900 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-stone-200/60 dark:border-stone-700/60">
            {approvedPct > 0 && (
              <div 
                className="h-full bg-emerald-500 rounded-xs transition-all duration-500" 
                style={{ width: `${approvedPct}%` }}
                title={`Aprobados: ${approved}`}
              />
            )}
            {pendingPct > 0 && (
              <div 
                className="h-full bg-stone-400 dark:bg-stone-600 rounded-xs transition-all duration-500" 
                style={{ width: `${pendingPct}%` }}
                title={`Pendientes: ${pending}`}
              />
            )}
            {riskyPct > 0 && (
              <div 
                className="h-full bg-amber-500 rounded-xs transition-all duration-500" 
                style={{ width: `${riskyPct}%` }}
                title={`En Revisión: ${risky}`}
              />
            )}
            {blockedPct > 0 && (
              <div 
                className="h-full bg-red-500 rounded-xs transition-all duration-500" 
                style={{ width: `${blockedPct}%` }}
                title={`Bloqueados: ${blocked}`}
              />
            )}
          </div>

          {/* Micro-leyenda de la barra */}
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-stone-600 dark:text-stone-400 pt-1 select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Aprobados ({approved})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Revisión ({risky})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Bloqueados ({blocked})</span>
            </div>
            {pending > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-stone-400"></span>
                <span>Pendientes ({pending})</span>
              </div>
            )}
          </div>
        </div>

        {/* Micro-texto técnico al pie */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-700/60 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
          <span>{t('dashboard.evaluatedFlowsSummary', { total })}</span>
          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <IconCheck className="w-3.5 h-3.5" />
            <span>Auditoría en vivo</span>
          </span>
        </div>
      </div>

      {/* Tarjetas Satélite Accionables */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Tarjeta: Flujos en Revisión */}
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-400 dark:hover:border-amber-600/60 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {t('dashboard.reviewActionTitle')}
              </span>
              <IconWarning className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
              {t('dashboard.reviewActionDesc')}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3 pt-1">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums text-amber-600 dark:text-amber-500 font-mono">
              {animatedRisky}
            </span>
            {onSelectFilter && (
              <button
                type="button"
                onClick={() => onSelectFilter('UNDER_REVIEW')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                {t('dashboard.filterReviewBtn')}
              </button>
            )}
          </div>
        </div>

        {/* Tarjeta: Incidentes Bloqueados */}
        <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-3 hover:border-red-400 dark:hover:border-red-600/60 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                {t('dashboard.blockedActionTitle')}
              </span>
              <IconBlocks className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 leading-snug">
              {t('dashboard.blockedActionDesc')}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3 pt-1">
            <span className="text-3xl font-extrabold tracking-tight tabular-nums text-red-600 dark:text-red-500 font-mono">
              {animatedBlocked}
            </span>
            {onSelectFilter && (
              <button
                type="button"
                onClick={() => onSelectFilter('BLOCKED')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                {t('dashboard.filterBlockedBtn')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};