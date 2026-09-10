import { useTranslation } from '../../i18n/useTranslation';

interface MetricsCardsProps {
  total: number;
  risky: number;
  blocked: number;
}

export const MetricsCards = ({ total, risky, blocked }: MetricsCardsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">{t('dashboard.metricsTotal')}</h3>
        <p className="text-4xl font-bold text-stone-900 dark:text-stone-50">{total}</p>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">{t('dashboard.metricsRisky')}</h3>
        <p className="text-4xl font-bold text-amber-600 dark:text-amber-500">{risky}</p>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">{t('dashboard.metricsBlocked')}</h3>
        <p className="text-4xl font-bold text-red-600 dark:text-red-500">{blocked}</p>
      </div>
    </div>
  );
};