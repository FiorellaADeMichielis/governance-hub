interface MetricsCardsProps {
  total: number;
  risky: number;
  blocked: number;
}

export const MetricsCards = ({ total, risky, blocked }: MetricsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Total Flows</h3>
        <p className="text-4xl font-bold text-stone-900 dark:text-stone-50">{total}</p>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Risky / Review</h3>
        <p className="text-4xl font-bold text-amber-600 dark:text-amber-500">{risky}</p>
      </div>
      <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-6 shadow-sm dark:shadow-md transition-colors">
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-2">Blocked</h3>
        <p className="text-4xl font-bold text-red-600 dark:text-red-500">{blocked}</p>
      </div>
    </div>
  );
};