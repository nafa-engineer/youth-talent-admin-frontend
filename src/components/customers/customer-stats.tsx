"use client";

import React, { useEffect, useState } from 'react';
import { customersApi } from '../../lib/api/customers';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Users, UserX, User, UserCheck } from 'lucide-react';

interface CustomerStatsProps {
  campusId: number | null;
}

export function CustomerStats({ campusId }: CustomerStatsProps) {
  const [totalCustomers, setTotalCustomers] = useState<number | null>(null);
  const [unassignedCustomers, setUnassignedCustomers] = useState<number | null>(null);
  const [ikhwanCustomers, setIkhwanCustomers] = useState<number | null>(null);
  const [akhwatCustomers, setAkhwatCustomers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const baseParams = campusId !== null ? { campusId } : {};

        const [total, unassigned, ikhwan, akhwat] = await Promise.all([
          customersApi.getCustomerCount(baseParams),
          customersApi.getCustomerCount({ ...baseParams, hasTeam: false }),
          customersApi.getCustomerCount({ ...baseParams, gender: 'PRIA' }),
          customersApi.getCustomerCount({ ...baseParams, gender: 'WANITA' }),
        ]);

        setTotalCustomers(total);
        setUnassignedCustomers(unassigned);
        setIkhwanCustomers(ikhwan);
        setAkhwatCustomers(akhwat);
      } catch (error) {
        console.error('Failed to fetch customer stats data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId]);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Peserta</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">{totalCustomers ?? 0}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Total peserta terdaftar</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Belum Punya Tim</CardTitle>
          <UserX className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-amber-600">{unassignedCustomers ?? 0}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Belum masuk kelompok/halaqah</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ikhwan (Pria)</CardTitle>
          <User className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-blue-600">{ikhwanCustomers ?? 0}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Peserta laki-laki</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Akhwat (Wanita)</CardTitle>
          <UserCheck className="h-4 w-4 text-pink-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold text-pink-600">{akhwatCustomers ?? 0}</div>
          )}
          <p className="text-xs text-muted-foreground mt-1">Peserta perempuan</p>
        </CardContent>
      </Card>
    </div>
  );
}
