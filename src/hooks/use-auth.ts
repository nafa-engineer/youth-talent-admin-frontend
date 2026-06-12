import { useAuthStore } from '../stores/auth-store';
import { UserRole } from '../types/auth';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const setProfile = useAuthStore((state) => state.setProfile);

  return {
    user,
    isAuthenticated,
    isSuperAdmin,
    login,
    logout,
    setProfile,
    
    // Helpers
    isAdmin: user?.type === UserRole.ADMIN,
    getCampusId: () => user?.campusId || null,
    getUserType: () => user?.type || null,
    getName: () => user?.name || '',
  };
};
