import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/TaskCard';
import API from '../api/axios';

const defaultForm = { title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } })
};

const Tasks = () => {
  const { tasks, fetchTasks, createTask, updateTask } = useTaskStore();
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) { await updateTask(editId, form); setEditId(null); }
    else await createTask(form);
    setForm(defaultForm);
    setShowForm(false);
    setSubtasks([]);
    setShowSubtasks(false);
  };

  const handleEdit = (task) => {
    setForm({ title: task.title, description: task.description || '', priority: task.priority, status: task.status, dueDate: task.dueDate || '' });
    setEditId(task.id);
    setShowForm(true);
    setSubtasks([]);
    setShowSubtasks(false);
  };

  const suggestPriority = async () => {
    if (!form.title) return alert('Enter a task title first');
    setAiLoading(true);
    try {
      const res = await API.post('/ai/suggest-priority', { title: form.title, description: form.description });
      setForm((f) => ({ ...f, priority: res.data.priority }));
    } catch { alert('AI suggestion failed'); }
    setAiLoading(false);
  };

  const breakdownTask = async () => {
    if (!form.title) return alert('Enter a task title first');
    setBreakdownLoading(true);
    try {
      const res = await API.post('/ai/breakdown', { title: form.title, description: form.description });
      setSubtasks(res.data.subtasks);
      setShowSubtasks(true);
    } catch { alert('AI breakdown failed'); }
    setBreakdownLoading(false);
  };

  const addSubtaskAsTask = async (subtask) => {
    await createTask({ title: subtask, priority: form.priority, status: 'pending', description: `Subtask of: ${form.title}` });
  };

  const addAllSubtasks = async () => {
    for (const subtask of subtasks) {
      await createTask({ title: subtask, priority: form.priority, status: 'pending', description: `Subtask of: ${form.title}` });
    }
    setShowSubtasks(false);
    setSubtasks([]);
    setShowForm(false);
    setForm(defaultForm);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    return matchPriority && matchStatus && matchSearch;
  });

  const filtered = (status) => filteredTasks.filter((t) => t.status === status);

  const columnConfig = [
    { status: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
    { status: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    { status: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-extrabold mb-1">Task Manager</h1>
            <p className="text-gray-400 text-sm">{tasks.length} tasks total · {filtered('completed').length} completed</p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm); setSubtasks([]); setShowSubtasks(false); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg"
          >
            {showForm ? '✕ Cancel' : '+ New Task'}
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 flex-wrap mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
        >
          <input
            type="text" placeholder="🔍 Search tasks..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 flex-1 min-w-48 bg-gray-50"
          />
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {(filterPriority !== 'all' || filterStatus !== 'all' || search) && (
            <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setSearch(''); }}
              className="text-sm text-red-400 hover:text-red-600 px-2 font-medium">
              ✕ Clear
            </button>
          )}
        </motion.div>

        {/* Task Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm space-y-4"
            >
              <h3 className="font-bold text-gray-800">{editId ? 'Edit Task' : 'New Task'}</h3>
              <input type="text" placeholder="Task title *" required value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50" />
              <textarea placeholder="Description (optional)" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-gray-50" rows={2} />
              <div className="flex gap-3 flex-wrap">
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50">
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-gray-50" />
              </div>
              <div className="flex gap-3 flex-wrap">
                <motion.button type="button" onClick={suggestPriority} disabled={aiLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm px-4 py-2 rounded-xl font-medium border border-purple-100">
                  {aiLoading ? '⏳ Thinking...' : '✨ AI Suggest Priority'}
                </motion.button>
                <motion.button type="button" onClick={breakdownTask} disabled={breakdownLoading}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm px-4 py-2 rounded-xl font-medium border border-blue-100">
                  {breakdownLoading ? '⏳ Breaking down...' : '🧠 AI Break Into Subtasks'}
                </motion.button>
              </div>
              <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                {editId ? 'Update Task' : 'Add Task'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Subtasks */}
        <AnimatePresence>
          {showSubtasks && subtasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-blue-800 text-sm">🧠 AI suggested {subtasks.length} subtasks</h3>
                <motion.button onClick={addAllSubtasks} whileHover={{ scale: 1.02 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-xl font-medium">
                  + Add All as Tasks
                </motion.button>
              </div>
              <div className="space-y-2">
                {subtasks.map((subtask, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center bg-white border border-blue-100 rounded-xl px-4 py-2.5">
                    <span className="text-sm text-gray-700">{subtask}</span>
                    <button onClick={() => addSubtaskAsTask(subtask)}
                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium">
                      + Add
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task count */}
        <p className="text-xs text-gray-400 mb-4 font-medium">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </p>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columnConfig.map((col) => (
            <div key={col.status}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">
                  {col.label}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${col.color}`}>
                  {filtered(col.status).length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {filtered(col.status).map((task, i) => (
                    <motion.div
                      key={task.id}
                      custom={i}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <TaskCard task={task} onEdit={handleEdit} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filtered(col.status).length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center">
                    <p className="text-sm text-gray-400">No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tasks;