"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../../hooks/use-auth';
import { ROUTES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  Users,
  UserCheck,
  Building,
  Shield,
  UserCog,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { isSuperAdmin, isCoach } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const adminNavItems = [
    { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: 'Manajemen Peserta', href: ROUTES.CUSTOMERS, icon: UserCheck },
    { name: 'Rekap Mentoring', href: ROUTES.MENTORING_RECAP, icon: BookOpen },
    { name: 'Leaderboard', href: ROUTES.LEADERBOARD, icon: Trophy },
    { name: 'Manajemen Tim', href: ROUTES.TEAMS, icon: Users },
  ];

  const masterDataItems = [
    { name: 'Manajemen Kampus', href: ROUTES.CAMPUSES, icon: Building },
    { name: 'Manajemen Admin', href: ROUTES.ADMINS, icon: Shield },
    { name: 'Manajemen Coach', href: ROUTES.COACHES, icon: UserCog },
  ];

  const coachNavItems = [
    { name: 'Rekap Amalan Tim', href: ROUTES.COACH_DEED_SCORE, icon: BookOpen },
    { name: 'Rekap Mentoring', href: ROUTES.COACH_MENTORING, icon: UserCheck },
    { name: 'Profil', href: ROUTES.COACH_PROFILE, icon: User },
  ];

  const mainNavItems = isCoach ? coachNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "flex flex-col h-screen border-r bg-sidebar transition-all duration-300 ease-in-out fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0",
          collapsed ? "w-[80px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <Image
                src="/yt.jpeg"
                alt="YouthTalent Logo"
                width={32}
                height={32}
                className="rounded-full shrink-0 object-cover border border-primary/20"
              />
              <span className="font-bold text-primary truncate">
                YouthTalent {isCoach && <span className="text-xs font-normal text-muted-foreground">Coach</span>}
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-full flex justify-center">
              <Image
                src="/yt.jpeg"
                alt="YouthTalent Logo"
                width={32}
                height={32}
                className="rounded-full object-cover border border-primary/20"
              />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-12 h-8 w-8 rounded-full z-10 hidden md:flex bg-background"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            <div className={cn("px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider", collapsed && "text-center")}>
              {collapsed ? '---' : 'Menu Utama'}
            </div>
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link key={item.name} href={item.href} onClick={onClose}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}>
                    <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground")} />
                    {!collapsed && <span>{item.name}</span>}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="absolute left-14 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                        {item.name}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {!isCoach && isSuperAdmin && (
            <nav className="space-y-1 px-3 mt-8">
              <div className={cn("px-3 mb-2 text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2", collapsed && "justify-center")}>
                {collapsed ? '---' : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                    Master Data
                  </>
                )}
              </div>
              {masterDataItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    <div className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                      isActive
                        ? "bg-accent/15 text-accent-foreground font-medium border border-accent/20"
                        : "text-sidebar-foreground hover:bg-accent/10 hover:text-accent-foreground"
                    )}>
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                      {!collapsed && <span>{item.name}</span>}

                      {collapsed && (
                        <div className="absolute left-14 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}