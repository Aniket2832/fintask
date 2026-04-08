import { useEffect, useState } from 'react';
import useFinanceStore from '../store/financeStore';
import useBudgetStore from '../store/budgetStore';
import FinanceCard from '../components/FinanceCard';

const defaultForm = { type: 'income', amount: '', category: '', description: '', date: '' };

const Finance = () => {
  const { finances, fetchFinances, createFinance, updateFinance } = useFinanceStore();
  const { budgets, fetchBudgets, setBudget, deleteBudget } = useBudgetStore();
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { fetchFinances(); fetchBudgets(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) { await updateFinance(editId, form); setEditId(null); }
    else await createFinance(form);
    setForm(defaultForm);
    setShowForm(false);
  };

  const handleEdit = (finance) => {
    setForm({ type: finance.type, amount: finance.amount, category: finance.category, description: finance.description || '', date: finance.date });
    setEditId(finance.id);
    setShowForm(true);
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    if (!budgetCategory || !budgetLimit) return;
    await setBudget(budgetCategory, parseFloat(budgetLimit));
    setBudgetCategory('');
    setBudgetLimit('');
    setShowBudgetForm(false);
  };

  const exportCSV = () => {
    const headers = ['Type', 'Amount', 'Category', 'Description', 'Date'];
    const rows = filteredFinances.map((f) => [f.type, f.amount, f.category, f.description || '', f.date]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintask_finance_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Monthly filter
  const filteredFinances = finances.filter((f) => f.date && f.date.startsWith(selectedMonth));

  // Get unique months from all entries for dropdown
  const availableMonths = [...new Set(finances.map((f) => f.date?.slice(0, 7)).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  const totalIncome = filteredFinances.filter((f) => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = filteredFinances.filter((f) => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  const getSpentInCategory = (category) =>
    filteredFinances.filter((f) => f.type === 'expense' && f.category === category).reduce((s, f) => s + f.amount, 0);

  const getBarColor = (percent) => {
    if (percent >= 100) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Finance</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={exportCSV}
            className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
            📥 Export CSV
          </button>
          <button onClick={() => setShowBudgetForm(!showBudgetForm)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm">
            {showBudgetForm ? 'Cancel' : '🎯 Set Budget'}
          </button>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm); }}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
            {showForm ? 'Cancel' : '+ New Entry'}
          </button>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex gap-3 items-center mb-6">
        <label className="text-sm font-medium text-gray-600">📅 Viewing:</label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
          {availableMonths.length > 0 ? availableMonths.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          )) : (
            <option value={selectedMonth}>{formatMonth(selectedMonth)}</option>
          )}
        </select>
        <span className="text-xs text-gray-400">{filteredFinances.length} entries</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Income</p>
          <p className="text-2xl font-bold text-green-700">₹{totalIncome}</p>
          <p className="text-xs text-green-500">{formatMonth(selectedMonth)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-500 font-medium">Expenses</p>
          <p className="text-2xl font-bold text-red-600">₹{totalExpense}</p>
          <p className="text-xs text-red-400">{formatMonth(selectedMonth)}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 font-medium">Balance</p>
          <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
            ₹{totalIncome - totalExpense}
          </p>
          <p className="text-xs text-gray-400">{formatMonth(selectedMonth)}</p>
        </div>
      </div>

      {/* Budget Form */}
      {showBudgetForm && (
        <form onSubmit={handleSetBudget} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Set Monthly Budget Limit</h3>
          <div className="flex gap-3">
            <input type="text" placeholder="Category (e.g. Food)" value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none flex-1" />
            <input type="number" placeholder="Limit (₹)" value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-32" />
            <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
              Save
            </button>
          </div>
        </form>
      )}

      {/* Budget Progress Bars */}
      {budgets.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4 text-sm">
            Budget Tracker — {formatMonth(selectedMonth)}
          </h3>
          <div className="space-y-4">
            {budgets.map((budget) => {
              const spent = getSpentInCategory(budget.category);
              const percent = Math.min((spent / budget.limit) * 100, 100);
              const isOver = spent > budget.limit;
              const isWarning = percent >= 80 && !isOver;
              return (
                <div key={budget.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                    <div className="flex items-center gap-2">
                      {isOver && <span className="text-xs text-red-600 font-semibold">⚠️ Over budget!</span>}
                      {isWarning && <span className="text-xs text-yellow-600 font-semibold">⚠️ Almost at limit!</span>}
                      <span className="text-xs text-gray-500">₹{spent} / ₹{budget.limit}</span>
                      <button onClick={() => deleteBudget(budget.id)} className="text-xs text-red-400 hover:text-red-600">✕</button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${getBarColor(percent)}`}
                      style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entry Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm space-y-3">
          <div className="flex gap-3 flex-wrap">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input type="number" placeholder="Amount *" required value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none w-32" />
            <input type="text" placeholder="Category *" required value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <input type="text" placeholder="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700">
            {editId ? 'Update Entry' : 'Add Entry'}
          </button>
        </form>
      )}

      {/* Finance List */}
      <div className="space-y-3">
        {filteredFinances.map((f) => <FinanceCard key={f.id} finance={f} onEdit={handleEdit} />)}
        {filteredFinances.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No entries for {formatMonth(selectedMonth)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;