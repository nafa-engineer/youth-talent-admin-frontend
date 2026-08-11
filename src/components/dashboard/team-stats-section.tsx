"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { teamsApi } from '../../lib/api/teams';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Users, UserIcon, UserCheck } from 'lucide-react';

interface TeamStatsSectionProps {
  campusId: number | null;
}

export function TeamStatsSection({ campusId }: TeamStatsSectionProps) {
  const [totalTeams, setTotalTeams] = useState<number | null>(null);
  const [ikhwanTeams, setIkhwanTeams] = useState<number | null>(null);
  const [akhwatTeams, setAkhwatTeams] = useState<number | null>(null);
  const [gradeData, setGradeData] = useState<{ grade: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const baseParams = campusId !== null ? { campusId } : {};

        // Fetch counts in parallel
        const [total, ikhwan, akhwat] = await Promise.all([
          teamsApi.getTeamCount(baseParams),
          teamsApi.getTeamCount({ ...baseParams, gender: 'PRIA' }),
          teamsApi.getTeamCount({ ...baseParams, gender: 'WANITA' })
        ]);

        setTotalTeams(total);
        setIkhwanTeams(ikhwan);
        setAkhwatTeams(akhwat);

        // Fetch grade distribution (Grade 1 - 5)
        const grades = [1, 2, 3, 4, 5];
        const gradePromises = grades.map(async (gradeVal) => {
          const totalGrade = await teamsApi.getTeamCount({ ...baseParams, grade: gradeVal });
          return { grade: `Kelas ${gradeVal}`, total: totalGrade };
        });

        const gradeResults = await Promise.all(gradePromises);
        setGradeData(gradeResults);
      } catch (error) {
        console.error('Failed to fetch team stats data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId]);

  return (
    <div className="space-y-6">
      {/* 3 Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-card to-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Kelompok</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{totalTeams}</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kelompok Ikhwan</CardTitle>
            <UserIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{ikhwanTeams}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Kelompok Akhwat</CardTitle>
            <UserCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold text-foreground">{akhwatTeams}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grade Bar Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Komposisi Kelompok per Jenjang (Grade)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
                <Skeleton className="w-16 h-[80px]" />
                <Skeleton className="w-16 h-[140px]" />
                <Skeleton className="w-16 h-[110px]" />
                <Skeleton className="w-16 h-[180px]" />
                <Skeleton className="w-16 h-[90px]" />
              </div>
            ) : gradeData.length === 0 ? (
              <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
                Tidak ada data kelompok per jenjang
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
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#e4e6eb' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                      formatter={(value) => [value, 'Total Kelompok']}
                    />
                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
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
