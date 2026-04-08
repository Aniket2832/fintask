import { create } from 'zustand';
import API from '../api/axios';

const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    const res = await API.get('/tasks');
    set({ tasks: res.data, loading: false });
  },

  createTask: async (data) => {
    const res = await API.post('/tasks', data);
    set((state) => ({ tasks: [res.data, ...state.tasks] }));
  },

  updateTask: async (id, data) => {
    const res = await API.put(`/tasks/${id}`, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? res.data : t)),
    }));
  },

  deleteTask: async (id) => {
    await API.delete(`/tasks/${id}`);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },
}));

export default useTaskStore;