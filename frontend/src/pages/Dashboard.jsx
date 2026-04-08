import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import useTaskStore from '../store/taskStore';
import useFinanceStore from '../store/financeStore';
import useAuthStore from '../store/authStore';
import API from '../api/axios';

const COLORS = ['#6b7280', '#3b82f6', '#22c55e'];
const DONUT_COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#14b8a6'];

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

  // Task status pie data
  const taskData = [
    { name: 'Pending', value: tasks.filter((t) => t.status === 'pending').length },
    { name: 'In Progress', value: tasks.filter((t) => t.status === 'in-progress').length },
    { name: 'Completed', value: tasks.filter((t) => t.status === 'completed').length },
  ];

  // Finance bar data
  const financeData = finances.reduce((acc, f) => {
    const existing = acc.find((a) => a.name === f.category);
    if (existing) existing[f.type] = (existing[f.type] || 0) + f.amount;
    else acc.push({ name: f.category, [f.type]: f.amount });
    return acc;
  }, []);

  // Spending donut data
  const spendingDonut = finances
    .filter((f) => f.type === 'expense')
    .reduce((acc, f) => {
      const existing = acc.find((a) => a.name === f.category);
      if (existing) existing.value += f.amount;
      else acc.push({ name: f.category, value: f.amount });
      return acc;
    }, []);

  // Last 7 days task completion line chart
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Welcome back, {user?.name}!</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Tasks</p>
          <p className="text-3xl font-bold text-gray-800">{tasks.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-green-600">{tasks.filter((t) => t.status === 'completed').length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-3xl font-bold text-green-600">₹{totalIncome}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
            ₹{totalIncome - totalExpense}
          </p>
        </div>
        <div className={`border rounded-xl p-4 shadow-sm ${streak > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
          <p className="text-sm text-gray-500">Daily Streak</p>
          <p className="text-3xl font-bold text-orange-500">{getStreakEmoji()} {streak}</p>
          <p className="text-xs text-gray-400">{streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>

      {/* Row 1 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Task Status Pie */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Task Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={taskData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {taskData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 7 Day Completion Line Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Tasks Completed — Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7Days}>
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Income vs Expense Bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Income vs Expense by Category</h2>
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
        </div>

        {/* Spending Donut */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Spending by Category</h2>
          {spendingDonut.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={spendingDonut}
                  cx="50%" cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {spendingDonut.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(val) => `₹${val}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-gray-400">
              No expense data yet
            </div>
          )}
        </div>
      </div>

      {/* AI Spending Insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-700">🧠 AI Spending Insights</h2>
          <button onClick={fetchInsights} disabled={insightsLoading}
            className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm px-4 py-2 rounded-lg">
            {insightsLoading ? 'Analysing...' : insightsFetched ? '🔄 Refresh Insights' : '✨ Get Insights'}
          </button>
        </div>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex gap-3 items-start bg-purple-50 border border-purple-100 rounded-lg p-3">
                <span className="text-purple-500 font-bold text-sm">{i + 1}.</span>
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Click "Get Insights" to analyse your spending with AI</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;