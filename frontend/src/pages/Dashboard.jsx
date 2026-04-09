import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import useTaskStore from '../store/taskStore';
import useFinanceStore from '../store/financeStore';
import useAuthStore from '../store/authStore';
import API from '../api/axios';

const COLORS = ['#6b7280', '#6366f1', '#22c55e'];
const DONUT_COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#14b8a6'];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
};

const Dashboard = () => {
  const { tasks, fetchTasks } = useTaskStore();
  const { finances, fetchFinances } = useFinanceStore();
  const { user } = useAuthStore();
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsFetched, setInsightsFetched] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchTasks();
    fetchFinances();
    API.get('/tasks/streak').then((res) => setStreak(res.data.streak)).catch(() => {});
  }, []);

  const taskData = [
    { name: 'Pending', value: tasks.filter((t) => t.status === 'pending').length },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length },
    { name: 'Completed', value: tasks.filter((t) => t.status === 'completed').length },
  ];

  const financeData = finances.reduce((acc, f) => {
    const existing = acc.find((a) => a.name === f.category);
    if (existing) existing[f.type] = (existing[f.type] || 0) + f.amount;
    else acc.push({ name: f.category, [f.type]: f.amount });
    return acc;
  }, []);

  const spendingDonut = finances
    .filter((f) => f.type === 'expense')
    .reduce((acc, f) => {
      const existing = acc.find((a) => a.name === f.category);
      if (existing) existing.value += f.amount;
      else acc.push({ name: f.category, value: f.amount });
      return acc;
    }, []);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const label = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const completed = tasks.filter((t) =>
      t.status === 'completed' &&
      new Date(t.updatedAt).toISOString().split('T')[0] === dateStr
    ).length;
    return { day: label, completed };
  });

  const totalIncome = finances.filter((f) => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter((f) => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  const fetchInsights = async () => {
    if (finances.length === 0) return alert('Add some finance entries first!');
    setInsightsLoading(true);
    try {
      const res = await API.post('/ai/spending-insights', { finances });
      setInsights(res.data.insights);
      setInsightsFetched(true);
    } catch { alert('Failed to fetch insights'); }
    setInsightsLoading(false);
  };

  const getStreakEmoji = () => {
    if (streak === 0) return '😴';
    if (streak < 3) return '🌱';
    if (streak < 7) return '🔥';
    if (streak < 14) return '⚡';
    return '🏆';
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const statCards = [
    { label: 'Total Tasks', value: tasks.length, color: 'text-gray-800', bg: 'bg-white' },
    { label: 'Completed', value: tasks.filter((t) => t.status === 'completed').length, color: 'text-green-600', bg: 'bg-white' },
    { label: 'Income', value: `₹${totalIncome}`, color: 'text-green-600', bg: 'bg-white' },
    { label: 'Balance', value: `₹${totalIncome - totalExpense}`, color: totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-600', bg: 'bg-white' },
    { label: 'Daily Streak', value: `${getStreakEmoji()} ${streak}`, color: 'text-orange-500', bg: streak > 0 ? 'bg-orange-50' : 'bg-white', sub: streak === 1 ? 'day' : 'days' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-extrabold mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h1>
            <p className="text-gray-400 text-sm">Here's your productivity overview for today.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 -mt-6">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className={`${card.bg} border border-gray-100 rounded-2xl p-4 shadow-sm`}
            >
              <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
              <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-gray-400">{card.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Task Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={taskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {taskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Tasks Completed — Last 7 Days</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={last7Days}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Income vs Expense by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={financeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Spending by Category</h2>
            {spendingDonut.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={spendingDonut} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                    dataKey="value" labelLine={false} label={renderCustomLabel}>
                    {spendingDonut.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(val) => `₹${val}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">No expense data yet</div>
            )}
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">🧠 AI Spending Insights</h2>
              <p className="text-xs text-gray-400 mt-0.5">Powered by Groq AI</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchInsights} disabled={insightsLoading}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm px-4 py-2 rounded-xl font-medium transition"
            >
              {insightsLoading ? '⏳ Analysing...' : insightsFetched ? '🔄 Refresh' : '✨ Get Insights'}
            </motion.button>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-3 items-start bg-indigo-50 border border-indigo-100 rounded-xl p-3"
                >
                  <span className="text-indigo-500 font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-gray-700">{insight}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">Click "Get Insights" to analyse your spending with AI</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;