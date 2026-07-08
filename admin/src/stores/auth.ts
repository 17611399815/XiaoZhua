import { create } from 'zustand';
import { authApi } from '../services/api';

interface AuthState {
  token: string | null;
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  username: localStorage.getItem('admin_username'),
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true });
    try {
      const res: any = await authApi.login(username, password);
      const { token } = res.data;
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_username', username);
      set({ token, username, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    set({ token: null, username: null });
  },
}));
