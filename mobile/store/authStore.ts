import { create } from 'zustand';
import { User } from '../types';
import { AuthService } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'CUSTOMER' | 'SHOP_OWNER';
  setUser: (user: User | null) => void;
  setActiveRole: (role: 'CUSTOMER' | 'SHOP_OWNER') => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  activeRole: 'CUSTOMER',

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      activeRole: user?.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
    }),

  setActiveRole: (activeRole) => set({ activeRole }),

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false, activeRole: 'CUSTOMER' });
  },
}));
