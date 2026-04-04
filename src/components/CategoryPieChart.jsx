import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';
import { buildCategorySpend, formatCurrency } from '../utils/helpers';
import { CATEGORY_COLORS } from '../data/transactions';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="card px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-ink-700 dark:text-ink-300">{d.name}</p>
      <p className="font-mono text-xs text-rose-500">{formatCurrency(d.value)}</p>
    </div>
  );
}

export default function CategoryPieChart() {
  const { transactions } = useApp();
  const data = useMemo(() => buildCategorySpend(transactions), [transactions]);

  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-200 mb-4">
        Spending by Category
      </h2>
      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-ink-400 text-sm">
          No expenses to display
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                   paddingAngle={3} dataKey="value">
                {data.map((entry) => (
                  <Cell key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="space-y-2 mt-3">
            {data.slice(0, 5).map(d => {
              const color = CATEGORY_COLORS[d.name] || CATEGORY_COLORS.Other;
              const total = data.reduce((s, i) => s + i.value, 0);
              const pct   = ((d.value / total) * 100).toFixed(0);
              return (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                  <span className="flex-1 text-ink-600 dark:text-ink-400 truncate">{d.name}</span>
                  <span className="text-ink-400 dark:text-ink-500">{pct}%</span>
                  <span className="font-mono font-medium text-ink-700 dark:text-ink-300 w-20 text-right">
                    {formatCurrency(d.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
