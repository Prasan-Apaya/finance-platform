import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSummary } from '../../hooks/useSummary';
import { useBudgetStatus } from '../../features/budgets/hooks';
import { useRecentTransactions } from '../../hooks/useRecentTransactions';
import { getCurrentMonth, formatMonth, formatCurrency } from '../../lib/format';
import MonthSwitcher from './MonthSwitcher';
import MetricCard from './MetricCard';
import DonutChart from './DonutChart';
import BarChartComponent from './BarChart';
import BudgetSection from './BudgetSection';
import RecentTransactions from './RecentTransactions';

export default function DashboardView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlMonth = searchParams.get('month') || getCurrentMonth();

  const summaryQuery = useSummary(urlMonth);
  const budgetQuery = useBudgetStatus(urlMonth);
  const transactionsQuery = useRecentTransactions();

  const summary = summaryQuery.data;
  const budgetStatus = budgetQuery.data;
  const transactions = transactionsQuery.data;

  const handleMonthChange = (month) => {
    setSearchParams({ month }, { replace: true });
  };

  const handleViewAllBudgets = () => {
    navigate('/budgets');
  };

  const isLoading = summaryQuery.isPending || budgetQuery.isPending || transactionsQuery.isPending;
  const hasError = summaryQuery.isError || budgetQuery.isError || transactionsQuery.isError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-secondary">Dashboard</h1>
        <MonthSwitcher month={urlMonth} onMonthChange={handleMonthChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-secondary border border-border-secondary rounded-xl p-4 animate-pulse">
              <div className="h-4 w-24 bg-primary_hover rounded mb-2"></div>
              <div className="h-10 w-32 bg-primary_hover rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-secondary border border-border-secondary rounded-xl p-4 animate-pulse h-[300px]">
            <div className="h-4 w-full bg-primary_hover rounded mb-4"></div>
            <div className="h-20 w-full bg-primary_hover rounded"></div>
          </div>
          <div className="bg-secondary border border-border-secondary rounded-xl p-4 animate-pulse h-[300px]">
            <div className="h-4 w-full bg-primary_hover rounded mb-4"></div>
            <div className="h-20 w-full bg-primary_hover rounded"></div>
          </div>
        </div>
        <div className="bg-secondary border border-border-secondary rounded-xl p-4 animate-pulse h-[200px]">
          <div className="h-4 w-full bg-primary_hover rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-primary_hover rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-secondary border border-border-secondary rounded-xl p-4 animate-pulse h-[200px]">
          <div className="h-4 w-full bg-primary_hover rounded mb-4"></div>
          <table className="w-full"><tbody>{[1, 2].map((i) => (
            <tr key={i} className="h-12"><td className="bg-primary_hover rounded" /></tr>
          ))}</tbody></table>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="text-center py-10 text-tertiary">
        Failed to load dashboard data.
      </div>
    );
  }

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpense = summary?.totalExpense ?? 0;
  const netSavings = summary?.netSavings ?? 0;
  const spendingByCategory = summary?.spendingByCategory ?? [];
  const monthlyTotals = summary?.monthlyTotals ?? [];
  const budgetItems = budgetStatus?.items ?? [];
  const percentUsed = budgetStatus?.percentUsed ?? 0;
  const totalLimit = budgetStatus?.totalLimit ?? 0;
  const totalSpent = budgetStatus?.totalSpent ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-secondary">Dashboard</h1>
          <p className="text-sm text-tertiary">{formatMonth(urlMonth)}</p>
        </div>
        <MonthSwitcher month={urlMonth} onMonthChange={handleMonthChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Income" value={formatCurrency(totalIncome)} />
        <MetricCard title="Spent" value={formatCurrency(totalExpense)} />
        <MetricCard title="Saved" value={formatCurrency(netSavings)} />
        <MetricCard
          title="Budget Used"
          value={percentUsed.toFixed(0) + '%'}
          subtitle={`${formatCurrency(totalSpent)} of ${formatCurrency(totalLimit)}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonutChart spendingByCategory={spendingByCategory} totalExpense={totalExpense} />
        <BarChartComponent monthlyTotals={monthlyTotals} />
      </div>

      <div className="bg-secondary border border-border-secondary rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-secondary">Budgets</h3>
          <button onClick={handleViewAllBudgets} className="text-xs text-brand-solid underline">Manage Budgets</button>
        </div>
        <BudgetSection items={budgetItems} onViewAll={handleViewAllBudgets} />
      </div>

      <div className="bg-secondary border border-border-secondary rounded-xl p-4">
        <RecentTransactions
          transactions={Array.isArray(transactions) ? transactions : (transactions?.content ?? [])}
          onViewAll={() => {}}
        />
      </div>
    </div>
  );
}
