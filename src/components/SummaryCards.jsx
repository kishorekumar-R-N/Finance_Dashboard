import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeSummary, formatCurrency } from '../utils/helpers';

// Individual summary card
function SummaryCard({ title, value, icon: Icon, colorClass, bgClass, trend }) {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-widest mb-1">
            {title}
          </p>
          <p className={`text-2xl font-display font-semibold tracking-tight ${colorClass}`}>
            {value}
          </p>
          {trend && (
            <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgClass}`}>
          <Icon size={20} className={colorClass} />
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards() {
  const { transactions } = useApp();
  const { income, expense, balance } = useMemo(() => computeSummary(transactions), [transactions]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Balance"
        value={formatCurrency(balance)}
        icon={Wallet}
        colorClass={balance >= 0 ? 'text-ink-900 dark:text-ink-100' : 'text-rose-500'}
        bgClass="bg-ink-100 dark:bg-ink-800"
        trend={`${transactions.length} transactions total`}
      />
      <SummaryCard
        title="Total Income"
        value={formatCurrency(income)}
        icon={TrendingUp}
        colorClass="text-emerald-600 dark:text-emerald-400"
        bgClass="bg-emerald-50 dark:bg-emerald-900/30"
        trend="All time earnings"
      />
      <SummaryCard
        title="Total Expenses"
        value={formatCurrency(expense)}
        icon={TrendingDown}
        colorClass="text-rose-500 dark:text-rose-400"
        bgClass="bg-rose-50 dark:bg-rose-900/30"
        trend="All time spending"
      />
    </div>
  );
}
