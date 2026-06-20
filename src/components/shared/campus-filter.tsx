"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { campusesApi } from '../../lib/api/campuses';
import { CampusDto } from '../../types/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface CampusFilterProps {
  value: number | null;
  onChange: (campusId: number | null) => void;
  className?: string;
}

export function CampusFilter({ value, onChange, className }: CampusFilterProps) {
  const { isSuperAdmin, user } = useAuth();
  const campusId = user?.campusId || null;
  const [campuses, setCampuses] = useState<CampusDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If Admin, they are locked to their own campus, no need to fetch all campuses
    if (!isSuperAdmin) {
      if (campusId) {
        // Automatically set the value to their campus if not already
        if (value !== campusId) {
          onChange(campusId);
        }
      }
      return;
    }

    // If Super Admin, fetch all campuses
    const fetchCampuses = async () => {
      setIsLoading(true);
      try {
        const data = await campusesApi.getCampuses();
        setCampuses(data);
      } catch (error) {
        console.error('Failed to fetch campuses', error);
        toast.error('Gagal memuat daftar kampus');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampuses();
  }, [isSuperAdmin, campusId, value, onChange]);

  // For Admin, just show a disabled select with their campus name
  if (!isSuperAdmin) {
    return (
      <Select disabled value={String(campusId)}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={user?.campusName || 'Kampus Anda'} />
        </SelectTrigger>
      </Select>
    );
  }

  // For Super Admin
  return (
    <Select 
      value={value === null ? "ALL" : String(value)} 
      onValueChange={(val) => onChange(val === "ALL" ? null : Number(val))}
      disabled={isLoading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={isLoading ? "Memuat..." : "Pilih Kampus"} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua Kampus</SelectItem>
        {campuses.map((campus) => (
          <SelectItem key={campus.id} value={String(campus.id)}>
            {campus.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
