import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useFinanceStore from '../store/financeStore';
import useBudgetStore from '../store/budgetStore';
import FinanceCard from '../components/FinanceCard';

const defaultForm = { type: 'income', amount: '', category: '', description: '', date: '' };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

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

  const filteredFinances = finances.filter((f) => f.date && f.date.startsWith(selectedMonth));
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

  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-8">
        <div className="max-w-5xl mx-auto flex justify-between items-start flex-wrap gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold mb-1">Finance Tracker</h1>
            <p className="text-gray-400 text-sm">{filteredFinances.length} entries · {formatMonth(selectedMonth)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 flex-wrap"
          >
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              📥 Export CSV
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              {showBudgetForm ? '✕ Cancel' : '🎯 Set Budget'}
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm); }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg">
              {showForm ? '✕ Cancel' : '+ New Entry'}
            </motion.button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Month Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
        >
          <label className="text-sm font-semibold text-gray-600">📅 Month:</label>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50">
            {availableMonths.length > 0 ? availableMonths.map((m) => (
              <option key={m} value={m}>{formatMonth(m)}</option>
            )) : (
              <option value={selectedMonth}>{formatMonth(selectedMonth)}</option>
            )}
          </select>
          <span className="text-xs text-gray-400">{filteredFinances.length} entries</span>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Income', value: `₹${totalIncome}`, color: 'text-green-600', bg: 'bg-green-50 border-green-100', sub: formatMonth(selectedMonth) },
            { label: 'Expenses', value: `₹${totalExpense}`, color: 'text-red-500', bg: 'bg-red-50 border-red-100', sub: formatMonth(selectedMonth) },
            { label: 'Balance', value: `₹${balance}`, color: balance >= 0 ? 'text-gray-800' : 'text-red-600', bg: 'bg-white border-gray-100', sub: balance >= 0 ? 'Surplus' : 'Deficit' },
          ].map((card, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="visible"
              whileHover={{ y: -2 }}
              className={`border rounded-2xl p-4 shadow-sm ${card.bg}`}>
              <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Budget Form */}
        <AnimatePresence>
          {showBudgetForm && (
            <motion.form
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              onSubmit={handleSetBudget}
              className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm"
            >
              <h3 className="font-bold text-gray-700 mb-3 text-sm">Set Monthly Budget Limit</h3>
              <div className="flex gap-3 flex-wrap">
                <input type="text" placeholder="Category (e.g. Food)" value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none flex-1 bg-gray-50" />
                <input type="number" placeholder="Limit (₹)" value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none w-32 bg-gray-50" />
                <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
                  Save
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Budget Tracker */}
        {budgets.length > 0 && (
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm"
          >
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              🎯 Budget Tracker — {formatMonth(selectedMonth)}
            </h3>
            <div className="space-y-4">
              {budgets.map((budget) => {
                const spent = getSpentInCategory(budget.category);
                const percent = Math.min((spent / budget.limit) * 100, 100);
                const isOver = spent > budget.limit;
                const isWarning = percent >= 80 && !isOver;
                return (
                  <div key={budget.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{budget.category}</span>
                      <div className="flex items-center gap-2">
                        {isOver && <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full">⚠️ Over budget!</span>}
                        {isWarning && <span className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full">⚠️ Almost at limit!</span>}
                        <span className="text-xs text-gray-400">₹{spent} / ₹{budget.limit}</span>
                        <button onClick={() => deleteBudget(budget.id)} className="text-xs text-red-300 hover:text-red-500 transition">✕</button>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-2 rounded-full ${getBarColor(percent)}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-gray-800">{editId ? 'Edit Entry' : 'New Entry'}</h3>
              <div className="flex gap-3 flex-wrap">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50">
                  <option value="income">💚 Income</option>
                  <option value="expense">❤️ Expense</option>
                </select>
                <input type="number" placeholder="Amount *" required value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none w-36 bg-gray-50" />
                <input type="text" placeholder="Category *" required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none flex-1 bg-gray-50" />
                <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-gray-50" />
              </div>
              <input type="text" placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none bg-gray-50" />
              <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                {editId ? 'Update Entry' : 'Add Entry'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Finance List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredFinances.map((f, i) => (
              <motion.div key={f.id} custom={i} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} layout>
                <FinanceCard finance={f} onEdit={handleEdit} />
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredFinances.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
              <p className="text-gray-400 text-sm">No entries for {formatMonth(selectedMonth)}</p>
              <p className="text-gray-300 text-xs mt-1">Click "+ New Entry" to add one</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finance;