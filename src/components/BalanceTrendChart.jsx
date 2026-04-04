import { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useApp } from '../context/AppContext';
import { buildMonthlyTrend, formatCurrency } from '../utils/helpers';

// Custom tooltip for the chart
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-4 py-3 shadow-lg text-sm">
      <p className="font-medium text-ink-700 dark:text-ink-300 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-ink-500 dark:text-ink-400 capitalize">{p.dataKey}:</span>
          <span className="font-medium font-mono text-xs">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function BalanceTrendChart() {
  const { transactions, darkMode } = useApp();
  const data = useMemo(() => buildMonthlyTrend(transactions), [transactions]);

  const gridColor  = darkMode ? '#27272f' : '#f0f0f2';
  const axisColor  = darkMode ? '#6b6b7a' : '#9191a0';

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-200 mb-6">
        Balance Trend
      </h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-ink-400 text-sm">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#34d399" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false}
                   tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="income"  type="monotone" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)"  dot={false} />
            <Area dataKey="expense" type="monotone" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" dot={false} />
            <Area dataKey="balance" type="monotone" stroke="#6366f1" strokeWidth={2.5} fill="url(#balanceGrad)" dot={{ fill: '#6366f1', r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
      {/* Legend */}
      <div className="flex gap-5 mt-4 text-xs text-ink-500 dark:text-ink-400">
        {[['#10b981','Income'],['#f43f5e','Expense'],['#6366f1','Balance']].map(([c,l]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
