import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatCompactCurrency } from '../../lib/format';

const COLORS = [
  'var(--color-utility-indigo-500)',
  'var(--color-utility-emerald-500)',
  'var(--color-utility-amber-500)',
  'var(--color-utility-sky-500)',
  'var(--color-utility-pink-500)',
  'var(--color-utility-orange-500)',
  'var(--color-utility-purple-500)',
  'var(--color-utility-slate-500)',
];

export default function DonutChart({ spendingByCategory, totalExpense }) {
  const top6 = spendingByCategory.slice(0, 6);
  const rest = spendingByCategory.slice(6);
  const restTotal = rest.reduce((sum, c) => sum + c.amount, 0);

  const data = [...top6];
  if (restTotal > 0) {
    data.push({ categoryId: 'other', name: 'Other', amount: restTotal });
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-secondary border border-border-secondary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-secondary mb-4">Spending by Category</h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const item = payload[0].payload;
                const percent = ((item.amount / total) * 100).toFixed(1);
                return (
                  <div className="bg-secondary border border-border-secondary p-3 rounded-lg shadow-sm">
                    <div className="text-xs text-tertiary mb-1">{item.name}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-medium text-secondary">{formatCurrency(item.amount)}</span>
                      <span className="text-xs text-tertiary">({percent}%)</span>
                    </div>
                  </div>
                );
              }}
            />
            <Pie
              data={data}
              dataKey="amount"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              labelLine={false}
              label={({ name, value, percent }) => {
                if (!name) return null;
                return (
                  <text x={0} y={0} textAnchor="middle" fontSize={10} fill="var(--text-primary)">
                    {name}: {percent ? percent.toFixed(0) + '%' : ''}
                  </text>
                );
              }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.categoryId}-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col items-center text-center">
          <div className="text-2xl font-bold text-secondary tabular-nums">{formatCompactCurrency(totalExpense)}</div>
          <div className="text-xs text-tertiary mt-1">Total Spent</div>
        </div>
        <div className="flex-1 max-h-[300px] overflow-y-auto space-y-2 text-sm">
          {data.map((item, index) => {
            const percent = ((item.amount / total) * 100).toFixed(1);
            const color = COLORS[index % COLORS.length];
            return (
              <div key={item.categoryId} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-primary_hover cursor-default">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary" title={item.name}>{item.name.length > 18 ? item.name.slice(0, 18) + '...' : item.name}</span>
                    <span className="text-tertiary">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="w-full bg-primary_hover h-1 rounded mt-0.5">
                    <div className={`h-full rounded`} style={{ width: percent + '%', backgroundColor: color }} />
                  </div>
                </div>
                <span className="text-xs text-tertiary tabular-nums">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}