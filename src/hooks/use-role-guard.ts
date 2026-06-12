import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { ROUTES } from '../lib/constants';

export const useRoleGuard = (requireSuperAdmin = false) => {
  const router = useRouter();
  const { isAuthenticated, isSuperAdmin } = useAuth();

  useEffect(() => {
    // If not authenticated, the middleware should have caught this.
    // But just in case, we can also redirect here.
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // If super admin is required but user is not super admin
    if (requireSuperAdmin && !isSuperAdmin) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isSuperAdmin, requireSuperAdmin, router]);

  return {
    isAuthorized: requireSuperAdmin ? isSuperAdmin : isAuthenticated,
  };
};
