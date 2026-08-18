export const StatusBadge = ({ status }: { status: string }) => {
  const getStyles = () => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800 border border-green-200';
      case 'BLOCKED': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStyles()}`}>
      {status}
    </span>
  );
};