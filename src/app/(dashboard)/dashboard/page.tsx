"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { CampusFilter } from '../../../components/shared/campus-filter';
import { GenderPieChart } from '../../../components/dashboard/gender-pie-chart';
import { CampusBarChart } from '../../../components/dashboard/campus-bar-chart';
import { EntryYearBarChart } from '../../../components/dashboard/entry-year-bar-chart';
import { TeamStatsSection } from '../../../components/dashboard/team-stats-section';
import { TeamCampusBarChart } from '../../../components/dashboard/team-campus-bar-chart';
import { TeamEntryYearChart } from '../../../components/dashboard/team-entry-year-chart';
import { MentoringSummarySection } from '../../../components/dashboard/mentoring-summary-section';
import { DeedScoreSection } from '../../../components/dashboard/deed-score-section';
import { customersApi } from '../../../lib/api/customers';
import { weeksApi } from '../../../lib/api/weeks';
import { WeekDto } from '../../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Skeleton } from '../../../components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Users, UserIcon, UserCheck, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { isSuperAdmin, getCampusId } = useAuth();
  const myCampusId = getCampusId();
  
  // ── Filter States ──
  const [selectedCampus, setSelectedCampus] = useState<number | null>(
    isSuperAdmin ? null : myCampusId
  );
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [weeks, setWeeks] = useState<WeekDto[]>([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState(false);
  
  // ── Summary States (Section 1) ──
  const [totalPeserta, setTotalPeserta] = useState<number | null>(null);
  const [totalIkhwan, setTotalIkhwan] = useState<number | null>(null);
  const [totalAkhwat, setTotalAkhwat] = useState<number | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  // ── Derived: campusId yang efektif ──
  const effectiveCampusId = !isSuperAdmin ? myCampusId : selectedCampus;

  // ── Derived: weekParams untuk Section 3 & 4 ──
  const weekParams = useMemo(() => {
    if (selectedWeek !== "ALL") {
      return { weekIds: [Number(selectedWeek)] };
    } else if (weeks.length > 0) {
      // Sort weeks ascending to find date range
      const sorted = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);
      return { 
        startDate: sorted[0].startDate, 
        endDate: sorted[sorted.length - 1].endDate 
      };
    }
    return {};
  }, [selectedWeek, weeks]);

  // ── Fetch Weeks (2 bulan ke belakang) ──
  useEffect(() => {
    const fetchWeeks = async () => {
      setIsLoadingWeeks(true);
      try {
        const today = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(today.getMonth() - 2);
        
        const startDateStr = twoMonthsAgo.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        const weeksList = await weeksApi.getWeeksByDateRange(startDateStr, endDateStr);
        // Sort descending so the newest week is first in dropdown
        weeksList.sort((a, b) => b.weekNumber - a.weekNumber);
        setWeeks(weeksList);
      } catch (error) {
        console.error('Failed to fetch weeks', error);
        toast.error('Gagal memuat filter pekan');
      } finally {
        setIsLoadingWeeks(false);
      }
    };
    fetchWeeks();
  }, []);

  // ── Fetch summary stats (#1, #2/#3) ──
  useEffect(() => {
    const fetchSummaries = async () => {
      setIsLoadingSummary(true);
      try {
        const baseParams = effectiveCampusId ? { campusId: effectiveCampusId } : {};
        
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

    fetchSummaries();
  }, [effectiveCampusId]);

  return (
    <div className="space-y-10 pb-12">
      {/* ═══ Header + Filters ═══ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Overview data peserta program YouthTalent secara real-time</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Campus Filter */}
          <div className="w-full sm:w-[220px]">
            <CampusFilter 
              value={selectedCampus} 
              onChange={setSelectedCampus} 
              className="w-full bg-card"
            />
          </div>

          {/* Week Filter (Only affects Sections 3 & 4) */}
          <div className="w-full sm:w-[260px]">
            <Select 
              value={selectedWeek} 
              onValueChange={(val) => setSelectedWeek(val || "ALL")}
              disabled={isLoadingWeeks}
            >
              <SelectTrigger className="w-full bg-card">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Pilih Pekan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Pekan (2 bulan terakhir)</SelectItem>
                {weeks.map((w) => (
                  <SelectItem key={w.id} value={String(w.id)}>
                    Pekan {w.weekNumber} ({w.startDate} s.d. {w.endDate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ═══ SECTION 1: Demografi Peserta (#1-5) ═══ */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">1. Demografi Peserta</h2>
          <p className="text-xs text-muted-foreground">Analisis data statistik profil mahasiswa terdaftar</p>
        </div>

        {/* 3 Stat Cards */}
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

        {/* Demografi Charts Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Pie Gender */}
          <GenderPieChart campusId={effectiveCampusId} />
          
          {/* Campus Bar Chart (SA only, when effectiveCampusId is null) */}
          {isSuperAdmin && effectiveCampusId === null ? (
            <CampusBarChart />
          ) : (
            <div className="col-span-1 lg:col-span-1 flex flex-col items-center justify-center border rounded-xl bg-muted/10 border-dashed p-6 text-center text-muted-foreground">
              <p className="text-xs font-medium">Distribusi Lintas Kampus</p>
              <p className="text-[10px] mt-1 text-muted-foreground/80">
                {isSuperAdmin 
                  ? "Pilih 'Semua Kampus' untuk menampilkan statistik komparatif lintas kampus."
                  : "Statistik komparatif hanya tersedia untuk Super Admin."}
              </p>
            </div>
          )}

          {/* Entry Year Chart */}
          <EntryYearBarChart campusId={effectiveCampusId} />
        </div>
      </section>

      {/* ═══ SECTION 2: Kelompok Mentoring (#6-10, #17) ═══ */}
      <section className="space-y-6 pt-4 border-t border-border/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">2. Kelompok Mentoring</h2>
          <p className="text-xs text-muted-foreground">Statistik pembagian halaqah / kelompok mentoring</p>
        </div>

        <TeamStatsSection campusId={effectiveCampusId} />

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* Team Campus Chart (SA only) */}
          {isSuperAdmin && effectiveCampusId === null ? (
            <div className="lg:col-span-2">
              <TeamCampusBarChart />
            </div>
          ) : (
            <div className="lg:col-span-2 flex flex-col items-center justify-center border rounded-xl bg-muted/10 border-dashed p-6 text-center text-muted-foreground">
              <p className="text-xs font-medium">Distribusi Kelompok Lintas Kampus</p>
              <p className="text-[10px] mt-1 text-muted-foreground/80">
                {isSuperAdmin 
                  ? "Pilih 'Semua Kampus' untuk menampilkan distribusi kelompok lintas kampus."
                  : "Statistik komparatif kelompok hanya tersedia untuk Super Admin."}
              </p>
            </div>
          )}

          {/* Team Entry Year Chart (Metric #17) */}
          <div className="lg:col-span-1">
            <TeamEntryYearChart campusId={effectiveCampusId} />
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: Kehadiran Mentoring (#11-13) ═══ */}
      <section className="space-y-6 pt-4 border-t border-border/40">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">3. Kehadiran Mentoring</h2>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-medium">
              Dipengaruhi Filter Pekan
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Persentase tingkat kehadiran peserta pada kegiatan mentoring mingguan</p>
        </div>

        <MentoringSummarySection 
          campusId={effectiveCampusId} 
          isSuperAdmin={isSuperAdmin}
          weekParams={weekParams}
        />
      </section>

      {/* ═══ SECTION 4: Skor Ibadah (#14-16) ═══ */}
      <section className="space-y-6 pt-4 border-t border-border/40">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">4. Skor Ibadah (Mutaba&apos;ah Yaumiyah)</h2>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-medium">
              Dipengaruhi Filter Pekan
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Rata-rata pencapaian skor ibadah harian mahasiswa</p>
        </div>

        <DeedScoreSection 
          campusId={effectiveCampusId} 
          isSuperAdmin={isSuperAdmin}
          weekParams={weekParams}
        />
      </section>
    </div>
  );
}
