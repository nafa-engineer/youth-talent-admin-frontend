import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';
import { ROUTES } from '../lib/constants';

export const useRoleGuard = (requireSuperAdmin = false) => {
  const router = useRouter();
  const { isAuthenticated, isSuperAdmin, isCoach, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN + '?from=roleGuard');
      return;
    }

    // Coach tidak boleh akses halaman admin sama sekali
    if (isCoach) {
      router.replace(ROUTES.COACH_DASHBOARD);
      return;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasHydrated, isAuthenticated, isSuperAdmin, isCoach, requireSuperAdmin, router]);

  return {
    isAuthorized: hasHydrated ? (requireSuperAdmin ? isSuperAdmin : isAuthenticated && !isCoach) : false,
  };
};

// Guard khusus untuk halaman coach
export const useCoachRoleGuard = () => {
  const router = useRouter();
  const { isAuthenticated, isCoach, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.replace(ROUTES.COACH_LOGIN + '?from=coachRoleGuard');
      return;
    }

    if (!isCoach) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [hasHydrated, isAuthenticated, isCoach, router]);

  return {
    isAuthorized: hasHydrated ? isCoach : false,
  };
};