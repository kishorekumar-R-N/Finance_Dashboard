import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/transactions';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  description: '',
  amount: '',
  category: '',
  type: 'expense',
  date: new Date().toISOString().split('T')[0],
};

export default function TransactionModal({ onClose, editTxn = null }) {
  const { addTransaction, editTransaction, transactions } = useApp();
  const [form, setForm]     = useState(editTxn ? {
    description: editTxn.description,
    amount: String(editTxn.amount),
    category: editTxn.category,
    type: editTxn.type,
    date: editTxn.date,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Trap focus inside modal on mount
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = 'Enter a valid positive amount';
    if (!form.category) e.category = 'Select a category';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const numAmount = Number(form.amount);

    if (form.type === 'expense') {
      const totalBalance = transactions.reduce((acc, t) => {
        return acc + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);
      
      let balanceToCheck = totalBalance;
      if (editTxn && editTxn.type === 'expense') {
        balanceToCheck += editTxn.amount;
      } else if (editTxn && editTxn.type === 'income') {
        balanceToCheck -= editTxn.amount;
      }
      
      if (numAmount > balanceToCheck) {
        toast.error('Transaction cannot be made because not enough of balance');
        return;
      }
    }

    const payload = { ...form, amount: numAmount };
    if (editTxn) {
      editTransaction(editTxn.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(err => ({ ...err, [field]: undefined }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/80 dark:bg-[#111315]/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-[#242730] border border-gray-200 dark:border-[#2C2F36] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editTxn ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-[#2C2F36] text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8A8E93] mb-1.5 uppercase tracking-wider">
              Type
            </label>
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-[#2C2F36] bg-white dark:bg-[#1A1C23]">
              {['income','expense'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all ${
                    form.type === t
                      ? t === 'income'
                        ? 'bg-[#CDFE64] text-[#111315] shadow-[0_0_15px_rgba(205,254,100,0.3)]'
                        : 'bg-[#FE6464] text-gray-900 dark:text-white shadow-[0_0_15px_rgba(254,100,100,0.3)]'
                      : 'bg-transparent text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-[#2C2F36]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8A8E93] mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <input
              className="w-full bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2C2F36] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-[#CDFE64] transition-colors placeholder-[#8A8E93]/50"
              placeholder="e.g. Monthly Salary"
              value={form.description}
              onChange={set('description')}
            />
            {errors.description && <p className="text-[#FE6464] text-xs mt-1 pl-1">{errors.description}</p>}
          </div>

          {/* Amount & Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8A8E93] mb-1.5 uppercase tracking-wider">
                Amount (₹)
              </label>
              <input
                className="w-full bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2C2F36] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-[#CDFE64] transition-colors placeholder-[#8A8E93]/50"
                type="number"
                placeholder="0"
                min="1"
                value={form.amount}
                onChange={set('amount')}
              />
              {errors.amount && <p className="text-[#FE6464] text-xs mt-1 pl-1">{errors.amount}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-[#8A8E93] mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select 
                className="w-full bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2C2F36] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-[#CDFE64] transition-colors appearance-none" 
                value={form.category} 
                onChange={set('category')}
              >
                <option value="" className="text-gray-500 dark:text-[#8A8E93]">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-[#FE6464] text-xs mt-1 pl-1">{errors.category}</p>}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8A8E93] mb-1.5 uppercase tracking-wider">
              Date
            </label>
            <input
              className="w-full bg-white dark:bg-[#1A1C23] border border-gray-200 dark:border-[#2C2F36] rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-[#CDFE64] transition-colors shrink-0"
              type="date"
              value={form.date}
              onChange={set('date')}
            />
            {errors.date && <p className="text-[#FE6464] text-xs mt-1 pl-1">{errors.date}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 text-sm font-semibold rounded-xl bg-white dark:bg-[#1A1C23] text-gray-900 dark:text-white border border-gray-200 dark:border-[#2C2F36] hover:bg-gray-100 dark:hover:bg-gray-100 dark:bg-[#2C2F36] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-3 text-sm font-bold rounded-xl bg-[#CDFE64] text-[#111315] hover:brightness-110 transition-all shadow-[0_0_15px_rgba(205,254,100,0.3)]"
          >
            {editTxn ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}
