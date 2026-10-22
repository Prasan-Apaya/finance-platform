import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCompactCurrency, formatShortMonth } from '../../lib/format';

const INCOME_COLOR = 'var(--color-utility-emerald-500)';
const EXPENSE_COLOR = 'var(--color-utility-slate-500)';

export default function BarChartComponent({ monthlyTotals }) {
  const data = monthlyTotals.map((m) => ({
    month: formatShortMonth(m.month),
    income: m.income,
    expense: m.expense,
  }));

  const customTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="bg-secondary border border-border-secondary p-3 rounded-lg shadow-sm min-w-[120px]">
        <div className="text-xs text-tertiary mb-2">{payload[0].name}</div>
        {payload.map((entry) => {
          const color = entry.dataKey === 'income' ? INCOME_COLOR : EXPENSE_COLOR;
          return (
            <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <div className="flex-1">
                <div className="text-xs text-secondary">{entry.dataKey === 'income' ? 'Income' : 'Expense'}</div>
              </div>
              <div className="text-xs font-medium text-secondary tabular-nums">{formatCompactCurrency(entry.value)}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-secondary border border-border-secondary rounded-xl p-4">
      <h3 className="text-sm font-semibold text-secondary mb-4">Monthly Trends</h3>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={12}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={INCOME_COLOR} />
                <stop offset="95%" stopColor={INCOME_COLOR} stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={EXPENSE_COLOR} />
                <stop offset="95%" stopColor={EXPENSE_COLOR} stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border-secondary)" strokeDasharray="2 4" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
            <YAxis tickLine={false} axisLine={false} hide tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} formatter={formatCompactCurrency} />
            <Tooltip content={customTooltip} />
            <Legend verticalAlign="top" align="center" height={36} fill={''} />
            <Bar name="Income" dataKey="income" stackId="a" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} />
            <Bar name="Expense" dataKey="expense" stackId="a" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}