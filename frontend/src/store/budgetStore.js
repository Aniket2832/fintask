import { create } from 'zustand';
import API from '../api/axios';

const useBudgetStore = create((set) => ({
  budgets: [],

  fetchBudgets: async () => {
    const res = await API.get('/budget');
    set({ budgets: res.data });
  },

  setBudget: async (category, limit) => {
    const res = await API.post('/budget', { category, limit });
    set((state) => {
      const exists = state.budgets.find((b) => b.category === category);
      if (exists) return { budgets: state.budgets.map((b) => b.category === category ? res.data : b) };
      return { budgets: [...state.budgets, res.data] };
    });
  },

  deleteBudget: async (id) => {
    await API.delete(`/budget/${id}`);
    set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) }));
  },
}));

export default useBudgetStore;