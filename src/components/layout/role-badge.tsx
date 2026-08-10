import React from 'react';
import { UserRole } from '../../types/auth';

interface RoleBadgeProps {
  role: UserRole | string | null;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (!role) return null;

  const isAdmin = role === UserRole.ADMIN;
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;
  const isCoach = role === UserRole.COACH;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      isAdmin ? 'bg-primary/10 text-primary border-primary/20' :
      isSuperAdmin ? 'bg-blue-500/10 text-blue-700 border-blue-500/20' :
      isCoach ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' :
      'bg-gray-100 text-gray-800 border-gray-200'
    }`}>
      {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      {isSuperAdmin && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
      {isCoach && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
      {isAdmin ? 'Admin' : isSuperAdmin ? 'Super Admin' : isCoach ? 'Coach' : role}
    </div>
  );
}