import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { buildMonthlyTrend, getTopCategory, computeSummary, formatCurrency } from '../utils/helpers';
import { Zap, TrendingUp, Hash } from 'lucide-react';

function InsightChip({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-ink-400 dark:text-ink-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-200 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-ink-500 capitalize">{p.name}:</span>
          <span className="font-mono font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function Insights() {
  const { transactions, darkMode } = useApp();

  const monthlyData = useMemo(() => buildMonthlyTrend(transactions), [transactions]);
  const topCat      = useMemo(() => getTopCategory(transactions),     [transactions]);
  const { income, expense } = useMemo(() => computeSummary(transactions), [transactions]);
  const savingsRate = income > 0 ? (((income - expense) / income) * 100).toFixed(0) : 0;

  const gridColor = darkMode ? '#27272f' : '#f0f0f2';
  const axisColor = darkMode ? '#6b6b7a' : '#9191a0';

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-200">
        Insights
      </h2>

      {/* 3 quick chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InsightChip
          icon={Zap}
          label="Top Spending"
          value={topCat ? `${topCat.name} · ${formatCurrency(topCat.value)}` : '—'}
          color="bg-amber-50 dark:bg-amber-900/30 text-amber-500"
        />
        <InsightChip
          icon={TrendingUp}
          label="Savings Rate"
          value={`${savingsRate}% of income saved`}
          color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <InsightChip
          icon={Hash}
          label="Total Transactions"
          value={`${transactions.length} records`}
          color="bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400"
        />
      </div>

      {/* Monthly income vs expense bar chart */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-4">
          Monthly Income vs Expense
        </h3>
        {monthlyData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-ink-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barGap={4} barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false}
                     tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} width={44} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {/* Legend */}
        <div className="flex gap-5 mt-3 text-xs text-ink-500 dark:text-ink-400">
          {[['#10b981','Income'],['#f43f5e','Expense']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className="w-3 h-2.5 rounded-sm inline-block" style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
