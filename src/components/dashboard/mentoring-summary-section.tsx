"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { mentoringApi } from '../../lib/api/mentoring';
import { campusesApi } from '../../lib/api/campuses';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { UserIcon, UserCheck } from 'lucide-react';

interface MentoringSummarySectionProps {
  campusId: number | null;
  isSuperAdmin: boolean;
  weekParams: Record<string, unknown>;
}

export function MentoringSummarySection({ campusId, isSuperAdmin, weekParams }: MentoringSummarySectionProps) {
  const [ikhwanPercent, setIkhwanPercent] = useState<number | null>(null);
  const [akhwatPercent, setAkhwatPercent] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<{ grade: string; percentage: number }[]>([]);
  const [campusData, setCampusData] = useState<{ name: string; percentage: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showCampusChart = isSuperAdmin && campusId === null;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const baseParams = {
          ...weekParams,
          ...(campusId !== null ? { campusId } : {})
        };

        // 1. Fetch Gender Summaries (PRIA & WANITA) in parallel
        const [ikhwanSummary, akhwatSummary] = await Promise.all([
          mentoringApi.getRecapSummary({ ...baseParams, gender: 'PRIA' }),
          mentoringApi.getRecapSummary({ ...baseParams, gender: 'WANITA' })
        ]);

        setIkhwanPercent(ikhwanSummary.averageAttendancePercentage);
        setAkhwatPercent(akhwatSummary.averageAttendancePercentage);

        // 2. Fetch Grade Summaries (Grade 1 - 5) in parallel
        const grades = [1, 2, 3, 4, 5];
        const gradePromises = grades.map(async (gradeVal) => {
          const summary = await mentoringApi.getRecapSummary({ ...baseParams, grade: gradeVal });
          return {
            grade: `Kelas ${gradeVal}`,
            percentage: Math.round(summary.averageAttendancePercentage * 10) / 10
          };
        });
        const gradeResults = await Promise.all(gradePromises);
        setGradeData(gradeResults);

        // 3. Fetch Campus Summaries (if Super Admin & no specific campus selected)
        if (showCampusChart) {
          const campuses = await campusesApi.getCampuses();
          const campusPromises = campuses.map(async (campus) => {
            const summary = await mentoringApi.getRecapSummary({ ...weekParams, campusId: campus.id });
            return {
              name: campus.name,
              percentage: Math.round(summary.averageAttendancePercentage * 10) / 10
            };
          });
          const campusResults = await Promise.all(campusPromises);
          // Sort by percentage descending
          campusResults.sort((a, b) => b.percentage - a.percentage);
          setCampusData(campusResults);
        } else {
          setCampusData([]);
        }
      } catch (error) {
        console.error('Failed to fetch mentoring summary data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId, weekParams, showCampusChart]);

  return (
    <div className="space-y-6">
      {/* 2 Stat Cards for Gender Kehadiran */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kehadiran Mentoring Ikhwan</CardTitle>
            <UserIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {ikhwanPercent !== null ? `${ikhwanPercent.toFixed(1)}%` : '-'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kehadiran Mentoring Akhwat</CardTitle>
            <UserCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">
                {akhwatPercent !== null ? `${akhwatPercent.toFixed(1)}%` : '-'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campus Chart (SA only) */}
        {showCampusChart && (
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Persentase Kehadiran per Kampus</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
                  <Skeleton className="w-12 h-[180px]" />
                  <Skeleton className="w-12 h-[210px]" />
                  <Skeleton className="w-12 h-[150px]" />
                  <Skeleton className="w-12 h-[240px]" />
                  <Skeleton className="w-12 h-[120px]" />
                </div>
              ) : campusData.length === 0 ? (
                <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
                  Tidak ada data kehadiran per kampus
                </div>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campusData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#e4e6eb' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                        formatter={(value) => [`${value}%`, 'Kehadiran']}
                      />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {campusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="var(--color-primary)" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grade Chart */}
        <Card className={`${!showCampusChart ? 'lg:col-span-2' : ''} border-primary/10 shadow-sm`}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Persentase Kehadiran per Jenjang (Grade)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
                <Skeleton className="w-12 h-[150px]" />
                <Skeleton className="w-12 h-[180px]" />
                <Skeleton className="w-12 h-[160px]" />
                <Skeleton className="w-12 h-[220px]" />
                <Skeleton className="w-12 h-[130px]" />
              </div>
            ) : gradeData.length === 0 ? (
              <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
                Tidak ada data kehadiran per jenjang
              </div>
            ) : (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gradeData}
                    margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="grade" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#e4e6eb' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                      formatter={(value) => [`${value}%`, 'Kehadiran']}
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {gradeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="var(--color-primary)" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
