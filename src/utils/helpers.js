// Format currency in Indian Rupees
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date to readable string
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format date to "Month YYYY" for grouping
export const formatMonth = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

// Compute summary totals from transactions
export const computeSummary = (transactions) => {
  const income  = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense };
};

// Build monthly trend data for line chart
export const buildMonthlyTrend = (transactions) => {
  const map = {};
  transactions.forEach(t => {
    const key = formatMonth(t.date);
    if (!map[key]) map[key] = { month: key, income: 0, expense: 0, balance: 0 };
    if (t.type === 'income')  map[key].income  += t.amount;
    if (t.type === 'expense') map[key].expense += t.amount;
  });
  // Compute running balance
  let running = 0;
  return Object.values(map).map(m => {
    running += m.income - m.expense;
    return { ...m, balance: running };
  });
};

// Build spending by category for pie chart (expenses only)
export const buildCategorySpend = (transactions) => {
  const map = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

// Get highest spending category
export const getTopCategory = (transactions) => {
  const spend = buildCategorySpend(transactions);
  return spend.length > 0 ? spend[0] : null;
};

// Generate a unique ID for new transactions
export const generateId = () => Date.now() + Math.floor(Math.random() * 1000);
