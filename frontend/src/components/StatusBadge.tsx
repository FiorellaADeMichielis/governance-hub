export const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    APPROVED: 'bg-green-600/10 text-green-700 dark:text-green-400 border-green-600/20',
    BLOCKED: 'bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20',
    REJECTED: 'bg-red-600/10 text-red-700 dark:text-red-400 border-red-600/20',
    RISKY: 'bg-amber-600/10 text-amber-700 dark:text-amber-400 border-amber-600/20',
    UNDER_REVIEW: 'bg-orange-600/10 text-orange-700 dark:text-orange-400 border-orange-600/20',
    PENDING: 'bg-stone-500/10 text-stone-700 dark:text-stone-400 border-stone-500/20',
  };

  const currentStyle = styles[status] || styles.PENDING;

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${currentStyle}`}>
      {status}
    </span>
  );
};