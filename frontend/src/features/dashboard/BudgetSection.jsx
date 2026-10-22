export default function BudgetSection({ items, onViewAll }) {
  const sorted = [...items].sort((a, b) => {
    const order = { EXCEEDED: 0, WARNING: 1, OK: 2 };
    if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
    return b.percentUsed - a.percentUsed;
  });

  if (sorted.length === 0) {
    return (
      <div className="bg-secondary border border-border-secondary rounded-xl p-6 text-center">
        <div className="text-tertiary mb-3">Set a budget to track your spending.</div>
        {onViewAll && <button onClick={onViewAll} className="text-sm text-brand-solid underline">Go to Budgets</button>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((item) => {
        const clamped = Math.min(item.percentUsed, 100);
        let barColor, statusColor, statusText;
        if (item.status === 'EXCEEDED') {
          barColor = 'var(--color-utility-rose-500)';
          statusColor = 'var(--color-utility-rose-500)';
          statusText = 'Exceeded';
        } else if (item.status === 'WARNING') {
          barColor = 'var(--color-utility-amber-500)';
          statusColor = 'var(--color-utility-amber-500)';
          statusText = 'Warning';
        } else {
          barColor = 'var(--color-utility-emerald-500)';
          statusColor = 'var(--color-utility-emerald-500)';
          statusText = 'On track';
        }

        const remaining = item.limit - item.spent;
        const remainingText = remaining >= 0
          ? `₹${remaining.toLocaleString('en-IN')} left`
          : `₹${Math.abs(remaining).toLocaleString('en-IN')} over`;

        return (
          <div key={item.categoryId} className="bg-secondary border border-border-secondary rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium text-secondary truncate max-w-[140px]" title={item.categoryName}>{item.categoryName}</div>
                <div className="text-xs text-tertiary mt-0.5">{statusText}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-secondary">{clamped}%</div>
              </div>
            </div>
            <div className="w-full bg-primary_hover h-2 rounded-full mb-2">
              <div
                className="h-full rounded-full"
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: clamped + '%', backgroundColor: barColor }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-tertiary tabular-nums">{item.spent.toLocaleString('en-IN')} of {item.limit.toLocaleString('en-IN')}</span>
              <span className={`font-medium ${remaining >= 0 ? 'text-secondary' : 'text-error-primary'}`}>{remainingText}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}