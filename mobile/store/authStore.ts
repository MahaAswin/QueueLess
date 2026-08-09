import { create } from 'zustand';
import { User } from '../types';
import { AuthService, LoginPayload, RegisterPayload } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'CUSTOMER' | 'SHOP_OWNER';
  setUser: (user: User | null) => void;
  setActiveRole: (role: 'CUSTOMER' | 'SHOP_OWNER') => void;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  checkAuthSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  activeRole: 'CUSTOMER',

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      activeRole: user?.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
    }),

  setActiveRole: (activeRole) => set({ activeRole }),

  login: async (payload) => {
    set({ isLoading: true });
    try {
      const response = await AuthService.login(payload);
      const user: User = {
        id: response.user.id,
        name: response.user.fullName,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
      };
      set({
        user,
        isAuthenticated: true,
        activeRole: user.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
        isLoading: false,
      });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      const response = await AuthService.register(payload);
      const user: User = {
        id: response.user.id,
        name: response.user.fullName,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role,
      };
      set({
        user,
        isAuthenticated: true,
        activeRole: user.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
        isLoading: false,
      });
      return user;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await AuthService.logout();
    set({
      user: null,
      isAuthenticated: false,
      activeRole: 'CUSTOMER',
      isLoading: false,
    });
  },

  checkAuthSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AuthService.getAccessToken();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
      const user = await AuthService.getCurrentUser();
      if (user) {
        set({
          user,
          isAuthenticated: true,
          activeRole: user.role === 'SHOP_OWNER' ? 'SHOP_OWNER' : 'CUSTOMER',
          isLoading: false,
        });
        return true;
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return false;
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return false;
    }
  },
}));
