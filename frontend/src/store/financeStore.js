import { create } from 'zustand';
import API from '../api/axios';

const useFinanceStore = create((set) => ({
  finances: [],
  loading: false,

  fetchFinances: async () => {
    set({ loading: true });
    const res = await API.get('/finance');
    set({ finances: res.data, loading: false });
  },

  createFinance: async (data) => {
    const res = await API.post('/finance', data);
    set((state) => ({ finances: [res.data, ...state.finances] }));
  },

  updateFinance: async (id, data) => {
    const res = await API.put(`/finance/${id}`, data);
    set((state) => ({
      finances: state.finances.map((f) => (f.id === id ? res.data : f)),
    }));
  },

  deleteFinance: async (id) => {
    await API.delete(`/finance/${id}`);
    set((state) => ({ finances: state.finances.filter((f) => f.id !== id) }));
  },
}));

export default useFinanceStore;