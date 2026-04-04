import React, { useState, useMemo } from 'react';
import { 
  Search, Grid, BarChart2, Users, MessageSquare, Star, Settings, HelpCircle,
  Moon, Sun, RefreshCw, Bell, Globe, ChevronDown, MoreVertical, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Monitor, ShoppingBag, PieChart as PieChartIcon, Phone, FileText, Zap, Hexagon, Plus, Trash2, Edit, Activity
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import TransactionModal from '../components/TransactionModal';
import { CATEGORY_COLORS } from '../data/transactions';

// Quick helper to roughly estimate time ago
const timeAgo = (ms) => {
  const diff = Date.now() - ms;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return `${Math.floor(diff/86400000)}d ago`;
};

export default function Dashboard() {
  const { transactions, role, setRole, isAdmin, deleteTransaction, resetTransactions, notifications, clearNotifications, darkMode, setDarkMode } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showSidebar, setShowSidebar] = useState(true);

  // ---------- CALCULATIONS ----------
  // Filtered transactions for the table and stats
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchQuery]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = totalIncome - totalExpense;

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    const grouped = {};
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      grouped[t.category] = (grouped[t.category] || 0) + t.amount;
    });
    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount, color: CATEGORY_COLORS[name] || '#8A8E93' }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const highestCategory = expensesByCategory.length > 0 ? expensesByCategory[0] : null;

  // Dynamic SVG Path for Line Chart based on balance over time
  const trendPaths = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const points = sorted.map(t => { runBal += (t.type === 'income' ? t.amount : -t.amount); return runBal; });
    
    if (points.length < 2) return { d: 'M0,80 L100,80', area: 'M0,80 L100,80 L100,100 L0,100 Z' };

    const min = Math.min(...points);
    const max = Math.max(...points) || 1;
    const range = (max - min) || 1;
    const stepX = 100 / (points.length - 1);
    
    const coords = points.map((p, i) => `${i * stepX},${100 - (((p - min) / range) * 60 + 20)}`);
    const d = `M${coords.join(' L')}`;
    const area = `${d} L100,100 L0,100 Z`;
    
    return { d, area };
  }, [filteredTransactions]);

  // Format currency
  const formatCur = (num) => {
    const val = Number(num) || 0;
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };

  return (
    <div className="flex w-full h-screen bg-[#F8F9FA] dark:bg-[#1F2128]">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-[#1A1C23] flex flex-col justify-between border-r border-gray-200 dark:border-[#2C2F36] shrink-0 h-full overflow-y-auto custom-scrollbar">
        <div>
          <div className="p-6 flex items-center gap-3">
            <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-10 h-10 rounded-full" />
            <div className="font-semibold text-gray-900 dark:text-white">Guy Hawkins</div>
          </div>

          <div className="px-6 mb-6">
            <div className="bg-white dark:bg-[#242730] flex items-center px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2C2F36]">
              <Search size={16} className="text-gray-500 dark:text-[#8A8E93]" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm ml-2 w-full placeholder-[#8A8E93]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="px-4">
            <div className="text-xs font-bold text-gray-500 dark:text-[#8A8E93] ml-2 mb-3 tracking-wider">DASHBOARDS</div>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('Overview')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'Overview' ? 'bg-[#CDFE64] text-[#111315] font-semibold shadow-[0_0_15px_rgba(205,254,100,0.3)]' : 'text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white'}`}
                >
                  <Grid size={18} />
                  <span>Overview</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('eCommerce')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'eCommerce' ? 'bg-[#CDFE64] text-[#111315] font-semibold shadow-[0_0_15px_rgba(205,254,100,0.3)]' : 'text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white'}`}
                >
                  <ShoppingBag size={18} />
                  <span>eCommerce</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab('Analytics')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'Analytics' ? 'bg-[#CDFE64] text-[#111315] font-semibold shadow-[0_0_15px_rgba(205,254,100,0.3)]' : 'text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white'}`}
                >
                  <BarChart2 size={18} />
                  <span>Analytics</span>
                </button>
              </li>
            </ul>

            <div className="text-xs font-bold text-gray-500 dark:text-[#8A8E93] ml-2 mb-3 mt-8 tracking-wider">SETTINGS</div>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => setActiveTab('Settings')} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${activeTab === 'Settings' ? 'bg-[#CDFE64] text-[#111315] font-semibold shadow-[0_0_15px_rgba(205,254,100,0.3)]' : 'text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:text-white'}`}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="p-6 mt-8">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold opacity-50">
            <Hexagon size={24} className="text-[#CDFE64]" fill="currentColor" />
            <span className="tracking-widest">DWISON</span>
          </div>
        </div>
      </aside>

      {/* CENTER CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto px-8 py-6 custom-scrollbar relative">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-sm">
            <Hexagon size={18} className="text-[#CDFE64]" />
            <Star size={16} className="text-gray-500 dark:text-[#8A8E93]" />
            <span className="text-gray-500 dark:text-[#8A8E93]">Dashboards</span>
            <span className="text-gray-500 dark:text-[#8A8E93]">/</span>
            <span className="text-gray-900 dark:text-white font-medium">Overview</span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 dark:text-[#8A8E93]">
            {/* ROLE TOGGLE */}
            <div className="flex items-center gap-2 bg-white dark:bg-[#242730] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#2C2F36]">
               <span className="text-xs font-medium uppercase">Role:</span>
               <select 
                 className="bg-transparent border-none text-gray-900 dark:text-white text-xs outline-none cursor-pointer"
                 value={role}
                 onChange={(e) => setRole(e.target.value)}
               >
                 <option value="viewer">Viewer (Read Only)</option>
                 <option value="admin">Admin (Edit)</option>
               </select>
            </div>
            
            <button onClick={() => setDarkMode(!darkMode)} className="outline-none focus:outline-none">
              {darkMode ? (
                <Sun size={18} className="hover:text-[#CDFE64] cursor-pointer transition-colors" />
              ) : (
                <Moon size={18} className="hover:text-[#CDFE64] cursor-pointer transition-colors" />
              )}
            </button>
            <Bell 
              size={18} 
              className={`cursor-pointer transition-colors ${showSidebar ? 'text-[#CDFE64]' : 'hover:text-[#CDFE64]'}`}
              onClick={() => setShowSidebar(!showSidebar)}
            />
          </div>
        </header>

        {/* Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-display font-medium text-gray-900 dark:text-white">{activeTab}</h1>
            {isAdmin && activeTab === 'Overview' && (
               <div className="flex gap-3">
                 <button 
                   onClick={() => {
                     if(window.confirm('Are you sure you want to delete all transactions and reset data to zero? This cannot be undone.')) {
                       resetTransactions();
                     }
                   }}
                   className="flex items-center gap-2 bg-white dark:bg-[#242730] border border-gray-200 dark:border-[#2C2F36] text-gray-900 dark:text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#1A1C23] transition-all"
                 >
                   <Trash2 size={16} className="text-[#FE6464]" /> Reset Data
                 </button>
                 <button 
                   onClick={() => { setEditingTxn(null); setModalOpen(true); }}
                   className="flex items-center gap-2 bg-[#CDFE64] text-[#111315] px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(205,254,100,0.3)] hover:brightness-110 transition-all"
                 >
                   <Plus size={16} /> Add Transaction
                 </button>
               </div>
            )}
          </div>

        {activeTab === 'Overview' ? (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Total Balance</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatCur(totalBalance)}</div>
                <div className="flex items-center gap-1 text-[#CDFE64] text-xs font-semibold">
                   <ArrowUpRight size={14} /> Calculated from visible data
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Total Income</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatCur(totalIncome)}</div>
                <div className="flex items-center gap-1 text-[#CDFE64] text-xs font-semibold">
                   <ArrowUpRight size={14} /> Visible Earnings
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Total Expenses</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatCur(totalExpense)}</div>
                <div className="flex items-center gap-1 text-[#FE6464] text-xs font-semibold">
                   <ArrowDownRight size={14} /> Visible Spending
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Activity Count</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{filteredTransactions.length}</div>
                <div className="flex items-center gap-1 text-[#CDFE64] text-xs font-semibold">
                   <FileText size={14} /> Visible Recorded Transactions
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              
              {/* Expenses Breakdown Categorical Chart */}
              <div className="col-span-6 bg-white dark:bg-[#242730] rounded-2xl p-6 border border-gray-200 dark:border-[#2C2F36] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                   <h2 className="text-lg font-medium text-gray-900 dark:text-white">Expense Breakdown</h2>
                   <MoreVertical size={16} className="text-gray-500 dark:text-[#8A8E93] cursor-pointer" />
                </div>
                <div className="flex items-center justify-between flex-1">
                   <div className="relative flex items-center justify-center w-40 h-40">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path className="text-gray-100 dark:text-[#2C2F36]" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        {expensesByCategory.map((cat, i) => {
                           const percentage = (cat.amount / (totalExpense || 1)) * 100;
                           let offset = 0;
                           for (let j=0; j<i; j++) offset -= (expensesByCategory[j].amount / (totalExpense || 1)) * 100;
                           
                           return (
                             <path key={cat.name} stroke={cat.color} strokeDasharray={`${percentage}, 100`} strokeDashoffset={offset} strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                           )
                        })}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{expensesByCategory.length}</span>
                        <span className="text-[10px] text-gray-500 dark:text-[#8A8E93]">Categories</span>
                      </div>
                   </div>
                   
                   <div className="flex-1 ml-8 overflow-y-auto max-h-40 custom-scrollbar pr-2">
                     <div className="grid grid-cols-1 gap-y-3 text-sm">
                        {expensesByCategory.map(cat => (
                           <div key={cat.name} className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-gray-500 dark:text-[#8A8E93]">
                               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                               {cat.name}
                             </div>
                             <div className="font-medium text-gray-900 dark:text-white">{formatCur(cat.amount)}</div>
                           </div>
                        ))}
                        {expensesByCategory.length === 0 && <div className="text-xs text-gray-500 dark:text-[#8A8E93]">No expenses recorded</div>}
                     </div>
                   </div>
                </div>
              </div>

              {/* Insights & Trend */}
              <div className="col-span-6 flex flex-col gap-4">
                 <div className="flex gap-4">
                    <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36] flex-1">
                      <div className="w-8 h-8 rounded-full bg-[#3E2A2A] border border-[#512A2A] flex items-center justify-center text-[#FE6464] mb-3">
                        <Zap size={16} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#8A8E93] mb-1">Highest Spending</div>
                      <div className="flex items-end gap-2 text-gray-900 dark:text-white font-bold text-lg">
                         {highestCategory ? highestCategory.name : 'Unknown'}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-[#8A8E93] mt-1">{highestCategory ? formatCur(highestCategory.amount) : '₹0'}</div>
                    </div>
                    <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36] flex-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#2A371F] border border-green-200 dark:border-[#3E512A] flex items-center justify-center text-[#CDFE64] mb-3">
                        <BarChart2 size={16} />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#8A8E93] mb-1">Monthly Observation</div>
                      <div className="flex gap-2 text-gray-900 dark:text-white font-medium text-sm leading-tight">
                         Savings rate looks healthy relative to expenses.
                      </div>
                    </div>
                 </div>

                 {/* Line Chart Card (Time Based Vis) */}
                 <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36] flex-1 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                       <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Balance Trend</div>
                          <div className="text-xs text-gray-500 dark:text-[#8A8E93] mb-2">Live computed overview</div>
                       </div>
                       <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCur(totalBalance)}</div>
                    </div>
                    {/* Dynamic Area Chart */}
                    <svg className="absolute bottom-0 left-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path fill="url(#gradient)" d={trendPaths.area} opacity="0.5"/>
                      <path stroke="#CDFE64" strokeWidth="2" fill="none" d={trendPaths.d} />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#CDFE64" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#CDFE64" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                 </div>
              </div>
            </div>

            {/* Third Row (Transactions Table) */}
            <div className="bg-white dark:bg-[#242730] rounded-2xl border border-gray-200 dark:border-[#2C2F36] overflow-hidden flex flex-col mb-12 shrink-0">
              <div className="p-6 border-b border-gray-200 dark:border-[#2C2F36] flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Transactions</h2>
                  <span className="text-xs text-gray-500 dark:text-[#8A8E93]">Showing {filteredTransactions.length} results</span>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-500 dark:text-[#8A8E93]">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-[#1A1C23]">
                          <th className="p-4 font-medium">Description</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Category</th>
                          <th className="p-4 font-medium text-right">Amount</th>
                          {isAdmin && <th className="p-4 font-medium text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="border-b border-gray-200 dark:border-[#2C2F36] border-opacity-50 hover:bg-gray-50 dark:hover:bg-[#1A1C23] transition-colors">
                            <td className="p-4 font-medium text-gray-900 dark:text-white">{t.description}</td>
                            <td className="p-4">{t.date}</td>
                            <td className="p-4 text-xs">
                              <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#2C2F36] text-gray-500 dark:text-[#8A8E93]">
                                {t.category}
                              </span>
                            </td>
                            <td className={`p-4 text-right font-medium ${t.type === 'income' ? 'text-[#a2de2c] dark:text-[#CDFE64]' : 'text-red-500 dark:text-[#FE6464]'}`}>
                              {t.type === 'income' ? '+' : '-'}{formatCur(t.amount)}
                            </td>
                            {isAdmin && (
                              <td className="p-4 text-right">
                                <button onClick={() => { setEditingTxn(t); setModalOpen(true); }} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#2C2F36] rounded text-gray-500 dark:text-[#8A8E93] hover:text-gray-900 dark:hover:text-white mr-1 transition-colors">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => deleteTransaction(t.id)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-[#2C2F36] rounded text-gray-500 dark:text-[#8A8E93] hover:text-red-500 dark:hover:text-[#FE6464] transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            )}
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={isAdmin ? 5 : 4} className="p-8 text-center text-gray-500 dark:text-[#8A8E93]">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-[#8A8E93]">
            <Hexagon size={64} className="mb-4 text-[#CDFE64] opacity-20" />
            <h2 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">{activeTab} Module</h2>
            <p>This module is currently under development.</p>
          </div>
        )}

      </main>

      {/* RIGHT SIDEBAR */}
      {showSidebar && (
        <aside className="w-[300px] bg-white dark:bg-[#1A1C23] flex flex-col border-l border-gray-200 dark:border-[#2C2F36] shrink-0 h-full overflow-y-auto p-6 custom-scrollbar">
           <div className="mb-8">
              <h3 className="text-gray-900 dark:text-white font-medium mb-6 flex justify-between items-center">
                <span>Notifications</span>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-gray-500 hover:text-red-500 transition-colors bg-gray-100 dark:bg-[#2C2F36] px-2 py-1 rounded">
                    Clear All
                  </button>
                )}
              </h3>
              <ul className="space-y-4">
                 {notifications.length === 0 && (
                   <li className="text-sm text-gray-500 dark:text-[#8A8E93]">No recent notifications.</li>
                 )}
                 {notifications.slice(0, 5).map(n => (
                   <li key={n.id} className="flex gap-3">
                     <div className="w-8 h-8 rounded-full bg-[#F8F9FA] dark:bg-[#1F2128] border border-gray-200 dark:border-[#2C2F36] flex items-center justify-center text-gray-500 dark:text-[#8A8E93] shrink-0">
                        <Activity size={14} className={n.type === 'add' ? 'text-[#CDFE64]' : n.type === 'delete' ? 'text-[#FE6464]' : ''}/>
                     </div>
                     <div>
                       <div className="text-sm text-gray-900 dark:text-white leading-tight">{n.msg}</div>
                       <div className="text-[10px] text-[#5D6B7A] mt-1">{timeAgo(n.time)}</div>
                     </div>
                   </li>
                 ))}
              </ul>
           </div>

           {/* Contacts (Visual retention) */}
           <div>
              <h3 className="text-gray-900 dark:text-white font-medium mb-6">Manager Contacts</h3>
              <ul className="space-y-2">
                 <li className="flex items-center justify-between p-2 hover:bg-white dark:bg-[#242730] rounded-xl transition-colors cursor-pointer">
                   <div className="flex items-center gap-3">
                     <img src="https://i.pravatar.cc/150?img=33" alt="Avatar" className="w-8 h-8 rounded-full" />
                     <span className="text-sm text-gray-900 dark:text-white">Daniel Craig</span>
                   </div>
                   <MoreHorizontal size={14} className="text-gray-500 dark:text-[#8A8E93]" />
                 </li>
                 <li className="flex items-center justify-between p-2 pl-3 bg-[#CDFE64] rounded-2xl shadow-[0_0_15px_rgba(205,254,100,0.3)] mt-2 mb-2 cursor-pointer relative">
                   <div className="flex items-center gap-3 relative z-10 text-[#111315]">
                     <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-8 h-8 rounded-full border-2 border-[#1A1C23]" />
                     <span className="text-sm font-bold">Nataniel Donowan</span>
                   </div>
                   <div className="w-6 h-6 rounded-md bg-[#111315]/10 flex items-center justify-center">
                     <Phone size={12} className="text-[#111315]" />
                   </div>
                 </li>
              </ul>
           </div>
        </aside>
      )}

      {/* Render Modal if requested */}
      {modalOpen && <TransactionModal onClose={() => setModalOpen(false)} editTxn={editingTxn} />}

    </div>
  );
}
