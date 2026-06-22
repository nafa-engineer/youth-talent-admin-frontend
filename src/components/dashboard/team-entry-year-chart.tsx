"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { teamsApi } from '../../lib/api/teams';
import { customersApi } from '../../lib/api/customers';
import { TeamDto } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface TeamEntryYearChartProps {
  campusId: number | null;
}

export function TeamEntryYearChart({ campusId }: TeamEntryYearChartProps) {
  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ year: string; total: number }[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  // 1. Fetch teams list when campusId changes
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const params = campusId !== null ? { campusId } : {};
        const data = await teamsApi.getTeams(params);
        setTeams(data);
        
        if (data.length > 0) {
          setSelectedTeamId(data[0].id);
        } else {
          setSelectedTeamId(null);
          setChartData([]);
        }
      } catch (error) {
        console.error('Failed to fetch teams', error);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [campusId]);

  // 2. Fetch chart data when selectedTeamId changes
  useEffect(() => {
    if (selectedTeamId === null) {
      setChartData([]);
      return;
    }

    const fetchChartData = async () => {
      setIsLoadingChart(true);
      try {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        
        const promises = years.map(async (year) => {
          const total = await customersApi.getCustomerCount({
            teamId: selectedTeamId,
            entryYear: year
          });
          return { year: year.toString(), total };
        });

        const results = await Promise.all(promises);
        setChartData(results);
      } catch (error) {
        console.error('Failed to fetch entry year distribution for team', error);
      } finally {
        setIsLoadingChart(false);
      }
    };

    fetchChartData();
  }, [selectedTeamId]);

  return (
    <Card className="border-primary/10 shadow-sm w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">Distribusi Angkatan per Kelompok</CardTitle>
          <p className="text-xs text-muted-foreground">Pilih kelompok mentoring untuk melihat sebaran tahun angkatan anggota</p>
        </div>
        <div className="w-full sm:w-[200px]">
          {isLoadingTeams ? (
            <Skeleton className="h-10 w-full" />
          ) : teams.length === 0 ? (
            <Select disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tidak ada kelompok" />
              </SelectTrigger>
            </Select>
          ) : (
            <Select 
              value={String(selectedTeamId)} 
              onValueChange={(val) => setSelectedTeamId(Number(val))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kelompok" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingChart ? (
          <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
            <Skeleton className="w-12 h-[60px]" />
            <Skeleton className="w-12 h-[100px]" />
            <Skeleton className="w-12 h-[160px]" />
            <Skeleton className="w-12 h-[200px]" />
            <Skeleton className="w-12 h-[240px]" />
          </div>
        ) : selectedTeamId === null ? (
          <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
            Tidak ada kelompok terpilih atau tersedia
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
            Tidak ada data untuk kelompok ini
          </div>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="year" 
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
                  formatter={(value) => [value, 'Total Anggota']}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
