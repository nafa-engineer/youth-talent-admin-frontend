import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  
  // Actions
  login: (user: AuthUser) => void;
  logout: () => void;
  setProfile: (data: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,

      login: (user: AuthUser) => set({
        user,
        isAuthenticated: true,
        isSuperAdmin: user.type === UserRole.SUPER_ADMIN
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        isSuperAdmin: false
      }),

      setProfile: (data: Partial<AuthUser>) => set((state) => {
        if (!state.user) return state;
        
        const updatedUser = { ...state.user, ...data };
        return {
          user: updatedUser,
          isSuperAdmin: updatedUser.type === UserRole.SUPER_ADMIN
        };
      })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
