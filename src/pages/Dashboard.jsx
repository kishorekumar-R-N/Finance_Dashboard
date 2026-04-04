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

  const monthlyObservation = useMemo(() => {
    const expenses = filteredTransactions.filter(t => t.type === 'expense');
    const incomes = filteredTransactions.filter(t => t.type === 'income');
    
    if (expenses.length === 0) return "No expenses recorded to generate observations.";

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const getMonthYear = (dateStr) => {
      const d = new Date(dateStr);
      return { m: d.getMonth(), y: d.getFullYear() };
    };

    const thisMonthExpenses = expenses.filter(t => { const d = getMonthYear(t.date); return d.m === currentMonth && d.y === currentYear; });
    const lastMonthExpenses = expenses.filter(t => { 
      const d = getMonthYear(t.date); 
      const lm = currentMonth === 0 ? 11 : currentMonth - 1;
      const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.m === lm && d.y === ly; 
    });

    const thisMonthTotal = thisMonthExpenses.reduce((acc, t) => acc + t.amount, 0);
    const lastMonthTotal = lastMonthExpenses.reduce((acc, t) => acc + t.amount, 0);

    const thisMonthIncomeTotal = incomes.filter(t => { const d = getMonthYear(t.date); return d.m === currentMonth && d.y === currentYear; }).reduce((acc, t) => acc + t.amount, 0);
    const lastMonthIncomeTotal = incomes.filter(t => { 
      const d = getMonthYear(t.date); 
      const lm = currentMonth === 0 ? 11 : currentMonth - 1;
      const ly = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.m === lm && d.y === ly; 
    }).reduce((acc, t) => acc + t.amount, 0);

    const thisMonthSavings = thisMonthIncomeTotal - thisMonthTotal;
    const lastMonthSavings = lastMonthIncomeTotal - lastMonthTotal;

    const observations = [];

    // 3. Unusual Spending Alert
    const categoryTotals = {};
    expenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });
    const thisMonthCatTotals = {};
    thisMonthExpenses.forEach(e => {
      thisMonthCatTotals[e.category] = (thisMonthCatTotals[e.category] || 0) + e.amount;
    });
    
    const monthsSet = new Set(expenses.map(e => e.date.substring(0, 7)));
    const monthsCount = monthsSet.size || 1;
    let unusualAlert = null;
    for (const cat in thisMonthCatTotals) {
       const avgCategory = (categoryTotals[cat] || 0) / monthsCount;
       if (thisMonthCatTotals[cat] > avgCategory * 1.5 && avgCategory > 0) {
         unusualAlert = `🚨 Unusual spending detected in ${cat} this month`;
         break;
       }
    }
    if (unusualAlert) observations.push(unusualAlert);

    // 4. Savings Insight
    const savingsDiff = thisMonthSavings - lastMonthSavings;
    if (savingsDiff > 0 && lastMonthSavings > 0) {
      observations.push(`💰 Great! You saved ₹${savingsDiff} more than last month`);
    }

    // 1. Spending Trend Insight
    if (thisMonthTotal > lastMonthTotal && lastMonthTotal > 0) {
      const percent = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      if (percent > 0) {
        observations.push(`📈 Spending increased by ${percent.toFixed(1)}% compared to last month`);
      }
    }

    // 5. Frequent Small Expenses
    const smallExpenses = expenses.filter(e => e.amount < 200);
    if (smallExpenses.length > 10) {
      observations.push("💳 Frequent small expenses are adding up significantly");
    }

    // 2. Category Dominance
    if (totalExpense > 0 && highestCategory) {
       const percent = (highestCategory.amount / totalExpense) * 100;
       observations.push(`📊 ${highestCategory.name} accounts for ${percent.toFixed(1)}% of your spending`);
    }

    // 6. Peak Spending Day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const spendingByDay = {};
    expenses.forEach(e => {
        const d = new Date(e.date).getDay();
        spendingByDay[d] = (spendingByDay[d] || 0) + e.amount;
    });
    const peakDayIndex = Object.keys(spendingByDay).sort((a,b) => spendingByDay[b] - spendingByDay[a])[0];
    if (peakDayIndex !== undefined) {
      observations.push(`📅 You spend most on ${days[peakDayIndex]}s`);
    }

    if (observations.length > 0) {
      // Pick a random observation on each calculation (page refresh)
      const randomIndex = Math.floor(Math.random() * observations.length);
      return observations[randomIndex];
    }
    
    return "💡 Savings rate looks healthy relative to expenses.";
  }, [filteredTransactions, totalExpense, highestCategory]);
  // Dynamic SVG Path for Line Chart based on balance over time
  const trendPaths = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runBal = 0;
    const dataPoints = sorted.map(t => { 
        runBal += (t.type === 'income' ? t.amount : -t.amount); 
        return { bal: runBal, date: t.date }; 
    });
    
    const color = '#38bdf8'; // Cyan color strictly from the image
    const isPositive = dataPoints.length > 0 ? dataPoints[dataPoints.length - 1].bal >= 0 : true;

    if (dataPoints.length < 2) return { d: 'M0,80 L100,80', color, isPositive, yLabels: [], xLabels: [] };

    const min = Math.min(...dataPoints.map(d => d.bal));
    const max = Math.max(...dataPoints.map(d => d.bal)) || 1;
    const range = (max - min) || 1;
    const stepX = 100 / (dataPoints.length - 1);
    
    const mappedPts = dataPoints.map((p, i) => ({
       x: i * stepX,
       y: 100 - (((p.bal - min) / range) * 80 + 10)
    }));

    // Smooth Bezier Curve 
    let dStr = `M ${mappedPts[0].x},${mappedPts[0].y}`;
    for (let i = 1; i < mappedPts.length; i++) {
       const prev = mappedPts[i-1];
       const curr = mappedPts[i];
       const dx = (curr.x - prev.x) / 2;
       dStr += ` C ${prev.x + dx},${prev.y} ${curr.x - dx},${curr.y} ${curr.x},${curr.y}`;
    }

    // Y Labels
    const yLabels = [];
    for(let i=0; i<=4; i++) {
        const val = min + (range / 4) * i;
        const normalizedY = 100 - (((val - min) / range) * 80 + 10);
        let label = '';
        const absVal = Math.abs(val);
        if (absVal >= 1000000) label = (val/1000000).toFixed(1) + 'M';
        else if (absVal >= 1000) label = (val/1000).toFixed(1) + 'K';
        else label = val.toFixed(0);
        yLabels.push({ val: label, top: normalizedY });
    }

    // X Labels
    const xLabels = [];
    const numX = Math.min(6, dataPoints.length);
    for(let i=0; i<numX; i++) {
       const index = Math.floor((dataPoints.length - 1) * (numX > 1 ? (i / (numX - 1)) : 0));
       const pt = dataPoints[index];
       if (!pt) continue;
       const dateObj = new Date(pt.date);
       const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
       xLabels.push({ val: label, left: mappedPts[index].x });
    }
    
    return { d: dStr, color, isPositive, yLabels, xLabels };
  }, [filteredTransactions]);

  // Format currency
  const formatCur = (num) => {
    const val = Number(num) || 0;
    const sign = val < 0 ? '-' : '';
    return sign + '₹' + Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
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
                 <option className="bg-white dark:bg-[#242730] text-gray-900 dark:text-white" value="viewer">Viewer (Read Only)</option>
                 <option className="bg-white dark:bg-[#242730] text-gray-900 dark:text-white" value="admin">Admin (Edit)</option>
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
                <div className="flex items-center gap-1 text-[#4a6b18] dark:text-[#CDFE64] text-xs font-semibold">
                   <ArrowUpRight size={14} /> Calculated from visible data
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Total Income</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatCur(totalIncome)}</div>
                <div className="flex items-center gap-1 text-[#4a6b18] dark:text-[#CDFE64] text-xs font-semibold">
                   <ArrowUpRight size={14} /> Visible Earnings
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Total Expenses</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{formatCur(totalExpense)}</div>
                <div className="flex items-center gap-1 text-red-600 dark:text-[#FE6464] text-xs font-semibold">
                   <ArrowDownRight size={14} /> Visible Spending
                </div>
              </div>
              <div className="bg-white dark:bg-[#242730] rounded-2xl p-5 border border-gray-200 dark:border-[#2C2F36]">
                <div className="text-gray-500 dark:text-[#8A8E93] text-sm mb-2">Activity Count</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{filteredTransactions.length}</div>
                <div className="flex items-center gap-1 text-[#4a6b18] dark:text-[#CDFE64] text-xs font-semibold">
                   <FileText size={14} /> Visible Recorded Transactions
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              
              {/* Expenses Breakdown Categorical Chart */}
              <div className="col-span-8 bg-white dark:bg-[#242730] rounded-2xl p-6 border border-gray-200 dark:border-[#2C2F36] flex flex-col">
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
                     <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
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

              {/* Insights */}
              <div className="col-span-4 flex flex-col gap-4">
                  <div className="bg-white dark:bg-[#242730] rounded-2xl p-6 border border-gray-200 dark:border-[#2C2F36] flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                       <div>
                         <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-[#3E2A2A] border border-red-200 dark:border-[#512A2A] flex items-center justify-center text-red-600 dark:text-[#FE6464] mb-2">
                           <Zap size={14} />
                         </div>
                         <div className="text-xs text-gray-500 dark:text-[#8A8E93] mb-1">Highest Spending</div>
                         <div className="flex items-end gap-2 text-gray-900 dark:text-white font-bold text-lg">
                            {highestCategory ? highestCategory.name : 'Unknown'}
                         </div>
                         <div className="text-[10px] text-gray-500 dark:text-[#8A8E93] mt-1">{highestCategory ? formatCur(highestCategory.amount) : '₹0'}</div>
                       </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#242730] rounded-2xl p-6 border border-gray-200 dark:border-[#2C2F36] flex-1 flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                       <div>
                         <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-[#2A371F] border border-green-200 dark:border-[#3E512A] flex items-center justify-center text-green-600 dark:text-[#CDFE64] mb-2">
                           <BarChart2 size={14} />
                         </div>
                         <div className="text-xs text-gray-500 dark:text-[#8A8E93] mb-1">Monthly Observation</div>
                         <div className="flex gap-2 text-gray-900 dark:text-white font-medium text-sm leading-tight pr-4">
                            {monthlyObservation}
                         </div>
                       </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Third Row: Big Line Chart (Time Based Vis) */}
            <div className="bg-white dark:bg-[#242730] rounded-xl border border-gray-200 dark:border-[#2C2F36] mb-8 relative overflow-hidden flex flex-col min-h-[450px] shrink-0 shadow-sm font-sans pt-6">
               <div className="relative z-10 px-8 flex justify-between items-start mb-4">
                  <div>
                     <div className="text-xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">Analyzing Profit Trends Over Time</div>
                     <div className="text-xs text-gray-400 dark:text-[#8A8E93] font-medium tracking-wide border-b border-gray-100 dark:border-gray-800 pb-4">Line Chart</div>
                  </div>
               </div>
               
               {/* Main Chart Area */}
               <div className="flex-1 w-full relative px-6 mt-4 pb-12 flex">
                  
                  {/* Y-Axis Labels */}
                  <div className="absolute left-4 top-0 bottom-12 w-10 flex flex-col text-[9px] text-[#A1A1AA] dark:text-[#8A8E93] font-medium z-10 pointer-events-none">
                     {trendPaths.yLabels.map((lbl, i) => (
                        <div key={i} className="absolute w-full text-right" style={{ top: `calc(${lbl.top}% - 6px)` }}>
                           {lbl.val}
                        </div>
                     ))}
                  </div>

                  {/* Graph Canvas */}
                  <div className="flex-1 relative ml-12 border-l border-gray-100 dark:border-[#2C2F36]">
                     {/* Horizontal Grid Lines */}
                     <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 dark:opacity-20">
                       <div className="border-b border-dashed border-gray-200 dark:border-[#52525B] w-full h-0"></div>
                       <div className="border-b border-dashed border-gray-200 dark:border-[#52525B] w-full h-0"></div>
                       <div className="border-b border-dashed border-gray-200 dark:border-[#52525B] w-full h-0"></div>
                       <div className="border-b border-dashed border-gray-200 dark:border-[#52525B] w-full h-0"></div>
                       <div className="border-b border-dashed border-gray-200 dark:border-[#52525B] w-full h-0"></div>
                     </div>
                     
                     {/* Vertical Grid Lines */}
                     <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40 dark:opacity-20 pl-px">
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                       <div className="border-l border-dashed border-gray-200 dark:border-[#52525B] h-full w-0"></div>
                     </div>

                     {/* SVG Smooth Line Curve */}
                     <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                       <path stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" d={trendPaths.d} />
                     </svg>
                     
                     {/* X-Axis Labels */}
                     <div className="absolute left-0 right-0 -bottom-6 h-6 z-10 pointer-events-none">
                        {trendPaths.xLabels.map((lbl, i) => (
                           <div key={i} className="absolute text-[9px] text-[#A1A1AA] dark:text-[#8A8E93] font-medium whitespace-nowrap transform -translate-x-1/2" style={{ left: `${lbl.left}%` }}>
                              {lbl.val}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Footer text */}
               <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center text-[10px] text-[#A1A1AA] dark:text-[#8A8E93]">
                  <span>Line Charts In Focus — A Comprehensive Guide to Effective Visualization</span>
                  <span>@FinanceDashboard</span>
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
