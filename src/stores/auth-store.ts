import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, UserRole } from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isCoach: boolean;
  hasHydrated: boolean;
  
  // Actions
  login: (user: AuthUser) => void;
  logout: () => void;
  setProfile: (data: Partial<AuthUser>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      isCoach: false,
      hasHydrated: false,

      login: (user: AuthUser) => {
        if (typeof document !== 'undefined' && user.accessToken) {
          document.cookie = `auth_token=${user.accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({
          user,
          isAuthenticated: true,
          isSuperAdmin: user.type === UserRole.SUPER_ADMIN,
          isCoach: user.type === UserRole.COACH,
        });
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
        }
        set({
          user: null,
          isAuthenticated: false,
          isSuperAdmin: false,
          isCoach: false,
        });
      },

      setProfile: (data: Partial<AuthUser>) => set((state) => {
        if (!state.user) return state;
        
        const updatedUser = { ...state.user, ...data };
        return {
          user: updatedUser,
          isSuperAdmin: updatedUser.type === UserRole.SUPER_ADMIN,
          isCoach: updatedUser.type === UserRole.COACH,
        };
      }),

      setHasHydrated: (state: boolean) => set({ hasHydrated: state })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
