import { useEffect, useState } from 'react';
import useTaskStore from '../store/taskStore';
import TaskCard from '../components/TaskCard';
import API from '../api/axios';

const defaultForm = { title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' };

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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(defaultForm); setSubtasks([]); setShowSubtasks(false); }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700">
          {showForm ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        <input
          type="text" placeholder="🔍 Search tasks..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 flex-1 min-w-48"
        />
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {(filterPriority !== 'all' || filterStatus !== 'all' || search) && (
          <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); setSearch(''); }}
            className="text-sm text-red-500 hover:text-red-700 px-2">
            ✕ Clear
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm space-y-3">
          <input type="text" placeholder="Task title *" required value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" />
          <textarea placeholder="Description (optional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400" rows={2} />
          <div className="flex gap-3 flex-wrap">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex gap-3 flex-wrap">
            <button type="button" onClick={suggestPriority} disabled={aiLoading}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm px-3 py-2 rounded-lg">
              {aiLoading ? 'Thinking...' : '✨ AI Suggest Priority'}
            </button>
            <button type="button" onClick={breakdownTask} disabled={breakdownLoading}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm px-3 py-2 rounded-lg">
              {breakdownLoading ? 'Breaking down...' : '🧠 AI Break Into Subtasks'}
            </button>
          </div>
          <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-gray-700">
            {editId ? 'Update Task' : 'Add Task'}
          </button>
        </form>
      )}

      {showSubtasks && subtasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-blue-800 text-sm">🧠 AI suggested {subtasks.length} subtasks:</h3>
            <button onClick={addAllSubtasks}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg">
              + Add All as Tasks
            </button>
          </div>
          <div className="space-y-2">
            {subtasks.map((subtask, i) => (
              <div key={i} className="flex justify-between items-center bg-white border border-blue-100 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-700">{subtask}</span>
                <button onClick={() => addSubtaskAsTask(subtask)}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded">
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task counts */}
      <p className="text-xs text-gray-400 mb-4">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['pending', 'in-progress', 'completed'].map((status) => (
          <div key={status}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              {status} ({filtered(status).length})
            </h2>
            <div className="space-y-3">
              {filtered(status).map((task) => <TaskCard key={task.id} task={task} onEdit={handleEdit} />)}
              {filtered(status).length === 0 && <p className="text-sm text-gray-400">No tasks</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;