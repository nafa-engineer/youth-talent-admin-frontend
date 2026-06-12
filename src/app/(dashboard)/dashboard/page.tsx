"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { CampusFilter } from '../../../components/shared/campus-filter';
import { GenderPieChart } from '../../../components/dashboard/gender-pie-chart';
import { CampusBarChart } from '../../../components/dashboard/campus-bar-chart';
import { customersApi } from '../../../lib/api/customers';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Users, UserIcon, UserCheck } from 'lucide-react';

export default function DashboardPage() {
  const { isSuperAdmin, getCampusId } = useAuth();
  
  // Initial state based on user role
  const [selectedCampus, setSelectedCampus] = useState<number | null>(
    isSuperAdmin ? null : getCampusId()
  );

  const [totalPeserta, setTotalPeserta] = useState<number | null>(null);
  const [totalIkhwan, setTotalIkhwan] = useState<number | null>(null);
  const [totalAkhwat, setTotalAkhwat] = useState<number | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      setIsLoadingSummary(true);
      try {
        const baseParams = selectedCampus ? { campusId: selectedCampus } : {};
        
        const [total, ikhwan, akhwat] = await Promise.all([
          customersApi.getCustomerCount(baseParams),
          customersApi.getCustomerCount({ ...baseParams, gender: 'PRIA' }),
          customersApi.getCustomerCount({ ...baseParams, gender: 'WANITA' })
        ]);

        setTotalPeserta(total);
        setTotalIkhwan(ikhwan);
        setTotalAkhwat(akhwat);
      } catch (error) {
        console.error('Error fetching summaries', error);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSummaries();
  }, [selectedCampus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Ringkasan Demografi</h2>
          <p className="text-muted-foreground text-sm">Overview data peserta program YouthTalent</p>
        </div>
        
        <div className="w-full sm:w-[250px]">
          <CampusFilter 
            value={selectedCampus} 
            onChange={setSelectedCampus} 
            className="w-full bg-card"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Peserta</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{totalPeserta}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Ikhwan</CardTitle>
            <UserIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{totalIkhwan}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Akhwat</CardTitle>
            <UserCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoadingSummary ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{totalAkhwat}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Pie Chart is affected by the global campus filter */}
        <GenderPieChart campusId={selectedCampus} />
        
        {/* Bar Chart shows distribution across ALL campuses. Only render for Super Admin or when looking at overall */}
        {isSuperAdmin && selectedCampus === null ? (
          <CampusBarChart />
        ) : (
          <div className="col-span-1 lg:col-span-2 flex items-center justify-center border rounded-xl bg-card/50 border-dashed p-8 text-center text-muted-foreground">
            {isSuperAdmin 
              ? "Pilih 'Semua Kampus' pada filter di atas untuk melihat grafik distribusi peserta per kampus."
              : "Grafik distribusi peserta antar kampus hanya tersedia untuk Super Admin."}
          </div>
        )}
      </div>
    </div>
  );
}
