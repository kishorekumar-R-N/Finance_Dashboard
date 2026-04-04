import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_TRANSACTIONS } from '../data/transactions';
import { generateId } from '../utils/helpers';

const AppContext = createContext(null);

// Load from localStorage or fall back to mock data
const loadTransactions = () => {
  try {
    const stored = localStorage.getItem('ledger_transactions');
    return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
  } catch {
    return INITIAL_TRANSACTIONS;
  }
};

const loadNotifications = () => {
  try {
    const stored = localStorage.getItem('ledger_notifications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export function AppProvider({ children }) {
  const [transactions, setTransactions] = useState(loadTransactions);
  const [notifications, setNotifications] = useState(loadNotifications);
  const [role, setRole]                 = useState(() => localStorage.getItem('ledger_role') || 'viewer');
  const [darkMode, setDarkMode]         = useState(() => localStorage.getItem('ledger_dark') === 'true');

  // Persist transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ledger_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('ledger_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('ledger_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('ledger_dark', darkMode);
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addNotification = (msg, type) => {
    setNotifications(prev => [{ id: generateId(), msg, type, time: Date.now() }, ...prev]);
  };

  const clearNotifications = () => setNotifications([]);

  // Add a new transaction (admin only)
  const addTransaction = (txn) => {
    setTransactions(prev => [{ ...txn, id: generateId() }, ...prev]);
    addNotification(`Added ${txn.description}: ₹${Number(txn.amount).toLocaleString('en-IN')}`, 'add');
  };

  // Edit an existing transaction
  const editTransaction = (id, updated) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    addNotification(`Edited ${updated.description || 'Unknown'} to ₹${Number(updated.amount).toLocaleString('en-IN')}`, 'edit');
  };

  // Delete a transaction
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addNotification(`Deleted a transaction`, 'delete');
  };

  // Reset ALL transactions
  const resetTransactions = () => {
    setTransactions([]);
    addNotification(`All transactions have been deleted`, 'delete');
  };

  const isAdmin = role === 'admin';

  const value = useMemo(() => ({
    transactions, addTransaction, editTransaction, deleteTransaction, resetTransactions,
    notifications, clearNotifications,
    role, setRole, isAdmin,
    darkMode, setDarkMode,
  }), [transactions, notifications, role, darkMode]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
