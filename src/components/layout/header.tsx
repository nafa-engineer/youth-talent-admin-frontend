"use client";
import React from 'react';
import { useAuth } from '../../hooks/use-auth';
import { RoleBadge } from './role-badge';
import { Button } from '../ui/button';
import { LogOut, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ROUTES } from '../../lib/constants';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isCoach } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (isCoach) {
      if (pathname.startsWith(ROUTES.COACH_DEED_SCORE)) return 'Rekap Amalan Tim';
      if (pathname.startsWith(ROUTES.COACH_MENTORING)) return 'Rekap Mentoring';
      if (pathname.startsWith(ROUTES.COACH_PROFILE)) return 'Profil Saya';
      return 'Dashboard Coach';
    }
    if (pathname === ROUTES.DASHBOARD) return 'Dashboard';
    if (pathname.startsWith(ROUTES.MENTORING_RECAP)) return 'Rekap Mentoring';
    if (pathname.startsWith(ROUTES.LEADERBOARD)) return 'Leaderboard';
    if (pathname.startsWith(ROUTES.TEAMS)) return 'Manajemen Tim';
    if (pathname.startsWith(ROUTES.CAMPUSES)) return 'Manajemen Kampus';
    if (pathname.startsWith(ROUTES.ADMINS)) return 'Manajemen Admin';
    if (pathname.startsWith(ROUTES.COACHES)) return 'Manajemen Coach';
    if (pathname.startsWith(ROUTES.PROFILE)) return 'Profil Saya';
    return 'Admin Dashboard';
  };

  const handleLogout = () => {
    logout();
    // Redirect handled by middleware or guarded hooks typically,
    // but explicit window location ensures a clean state 
    window.location.href = isCoach ? ROUTES.COACH_LOGIN : ROUTES.LOGIN;
  };

  const subtitle = isCoach
    ? `${user?.teamIds?.length ?? 0} Tim Dibina`
    : (user?.campusName || 'Semua Kampus');

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger could be here */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium leading-none">{user?.name || 'User'}</span>
          <span className="text-xs text-muted-foreground mt-1">{subtitle}</span>
        </div>

        <RoleBadge role={user?.type || null} />
        <div className="h-8 w-px bg-border mx-2 hidden sm:block" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Keluar</span>
        </Button>
      </div>
    </header>
  );
}