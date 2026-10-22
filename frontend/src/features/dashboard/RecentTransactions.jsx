import { formatDate, formatCurrency } from '../../lib/format';

export default function RecentTransactions({ transactions, onViewAll }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-secondary border border-border-secondary rounded-xl p-6 text-center">
        <div className="text-tertiary mb-3">No spending recorded yet.</div>
        <div className="text-xs text-tertiary mb-4">Add your first transaction to see your month at a glance.</div>
        <button onClick={onViewAll} className="text-sm text-brand-solid underline">View all transactions</button>
      </div>
    );
  }

  return (
    <div className="bg-secondary border border-border-secondary rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-secondary">Recent Transactions</h3>
        <button onClick={onViewAll} className="text-xs text-brand-solid underline">View all</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border-secondary text-xs text-tertiary">
              <th className="pb-2">Date</th>
              <th className="pb-2">Category</th>
              <th className="pb-2">Note</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-secondary">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'INCOME';
              return (
                <tr key={tx.id} className="text-sm">
                  <td className="py-3 text-tertiary">{formatDate(tx.date)}</td>
                  <td className="py-3 text-secondary truncate max-w-[120px]" title={tx.category?.name || '-'}>{tx.category?.name || '-'}</td>
                  <td className="py-3 text-tertiary truncate max-w-[160px]" title={tx.note || ''}>{tx.note || '-'}</td>
                  <td className="py-3 text-right">
                    <span className={`font-medium tabular-nums ${isIncome ? 'text-emerald-500' : 'text-secondary'}`}>
                      {isIncome ? '+' : ''}{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}