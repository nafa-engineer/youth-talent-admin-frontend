import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { ROUTES } from '../lib/constants';

export const useRoleGuard = (requireSuperAdmin = false) => {
  const router = useRouter();
  const { isAuthenticated, isSuperAdmin, hasHydrated } = useAuth();

  useEffect(() => {
    // Wait until Zustand store has finished rehydration
    if (!hasHydrated) return;

    // If not authenticated after hydration
    if (!isAuthenticated) {
      console.log('useRoleGuard redirecting to login. hasHydrated:', hasHydrated, 'isAuthenticated:', isAuthenticated);
      router.replace(ROUTES.LOGIN + '?from=roleGuard');
      return;
    }

    // If super admin is required but user is not super admin
    if (requireSuperAdmin && !isSuperAdmin) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasHydrated, isAuthenticated, isSuperAdmin, requireSuperAdmin, router]);

  return {
    isAuthorized: hasHydrated ? (requireSuperAdmin ? isSuperAdmin : isAuthenticated) : false,
  };
};
