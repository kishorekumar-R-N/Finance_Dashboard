import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Pencil, Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { CATEGORY_COLORS } from '../data/transactions';
import TransactionModal from './TransactionModal';

export default function TransactionsTable() {
  const { transactions, isAdmin, deleteTransaction } = useApp();

  // Filter / search state
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('all');   // all | income | expense
  const [sortField,  setSortField]  = useState('date');  // date | amount
  const [sortDir,    setSortDir]    = useState('desc');  // asc | desc

  // Modal state
  const [showModal, setShowModal]   = useState(false);
  const [editTxn,   setEditTxn]    = useState(null);

  const openAdd  = ()    => { setEditTxn(null); setShowModal(true); };
  const openEdit = (txn) => { setEditTxn(txn);  setShowModal(true); };
  const close    = ()    => { setShowModal(false); setEditTxn(null); };

  // Toggle sort
  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  // Filtered + sorted transactions
  const filtered = useMemo(() => {
    let list = transactions;

    if (typeFilter !== 'all') list = list.filter(t => t.type === typeFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date')   cmp = new Date(a.date) - new Date(b.date);
      if (sortField === 'amount') cmp = a.amount - b.amount;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [transactions, search, typeFilter, sortField, sortDir]);

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-40" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-ink-900 dark:text-ink-100" />
      : <ArrowDown size={12} className="text-ink-900 dark:text-ink-100" />;
  };

  return (
    <div className="card p-6">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="font-display text-lg font-semibold text-ink-800 dark:text-ink-200">
          Transactions
        </h2>
        {isAdmin && (
          <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
            <Plus size={15} /> Add Transaction
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input-field pl-8"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="flex rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700 text-sm self-start">
          {['all','income','expense'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900 font-medium'
                  : 'text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-ink-400 dark:text-ink-500 text-sm">
              {search || typeFilter !== 'all'
                ? 'No transactions match your filters.'
                : 'No transactions yet. Add one!'}
            </p>
          </div>
        ) : (
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800">
                {/* Date */}
                <th className="text-left pb-3">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider hover:text-ink-700 dark:hover:text-ink-300 transition-colors"
                  >
                    Date <SortIcon field="date" />
                  </button>
                </th>
                <th className="text-left pb-3 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="text-left pb-3 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left pb-3 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider">
                  Type
                </th>
                {/* Amount */}
                <th className="text-right pb-3">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center gap-1 text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-wider hover:text-ink-700 dark:hover:text-ink-300 transition-colors ml-auto"
                  >
                    Amount <SortIcon field="amount" />
                  </button>
                </th>
                {isAdmin && <th className="pb-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((txn, i) => (
                <tr
                  key={txn.id}
                  className="border-b border-ink-50 dark:border-ink-800/60 hover:bg-ink-50 dark:hover:bg-ink-800/40 transition-colors group"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="py-3 pr-4 text-xs text-ink-400 dark:text-ink-500 font-mono whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>
                  <td className="py-3 pr-4 text-sm text-ink-700 dark:text-ink-300 font-medium">
                    {txn.description}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: (CATEGORY_COLORS[txn.category] || '#94a3b8') + '22',
                        color: CATEGORY_COLORS[txn.category] || '#94a3b8',
                      }}
                    >
                      {txn.category}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {txn.type === 'income'
                      ? <span className="badge-income">Income</span>
                      : <span className="badge-expense">Expense</span>
                    }
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-mono text-sm font-semibold ${
                      txn.type === 'income'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-500 dark:text-rose-400'
                    }`}>
                      {txn.type === 'income' ? '+' : '−'}{formatCurrency(txn.amount)}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(txn)}
                          className="p-1.5 hover:bg-ink-100 dark:hover:bg-ink-700 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => deleteTransaction(txn.id)}
                          className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-ink-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-ink-400 dark:text-ink-500 mt-4">
          Showing {filtered.length} of {transactions.length} transactions
        </p>
      )}

      {/* Modal */}
      {showModal && <TransactionModal onClose={close} editTxn={editTxn} />}
    </div>
  );
}
