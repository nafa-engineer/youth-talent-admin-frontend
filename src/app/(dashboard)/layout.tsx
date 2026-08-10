"use client";
import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/layout/sidebar';
import { Header } from '../../components/layout/header';
import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../lib/constants';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, hasHydrated, isCoach } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    if (hasHydrated && !isAuthenticated) {
      router.replace((isCoach ? ROUTES.COACH_LOGIN : ROUTES.LOGIN) + '?from=layout');
    }
  }, [hasHydrated, isAuthenticated, isCoach, router]);

  // Prevent hydration mismatch and redirect race condition by waiting until store has hydrated
  if (!isClient || !hasHydrated) return null;
  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar mobileOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
      <div className="flex-1 flex flex-col w-full min-w-0 relative">
        <Header onMenuClick={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}