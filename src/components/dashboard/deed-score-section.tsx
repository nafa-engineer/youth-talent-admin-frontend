"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { deedScoreApi } from '../../lib/api/deed-score';
import { campusesApi } from '../../lib/api/campuses';
import { DeedScoreAverageDto, ActivityAverageDto } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { UserIcon, UserCheck } from 'lucide-react';

interface DeedScoreSectionProps {
  campusId: number | null;
  isSuperAdmin: boolean;
  weekParams: Record<string, any>;
}

interface ChartItem {
  name: string;
  score: number;
  activities: ActivityAverageDto[];
}

export function DeedScoreSection({ campusId, isSuperAdmin, weekParams }: DeedScoreSectionProps) {
  const [ikhwanScore, setIkhwanScore] = useState<number | null>(null);
  const [ikhwanActivities, setIkhwanActivities] = useState<ActivityAverageDto[]>([]);
  
  const [akhwatScore, setAkhwatScore] = useState<number | null>(null);
  const [akhwatActivities, setAkhwatActivities] = useState<ActivityAverageDto[]>([]);

  const [gradeData, setGradeData] = useState<ChartItem[]>([]);
  const [campusData, setCampusData] = useState<ChartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const showCampusChart = isSuperAdmin && campusId === null;

  // Helper to calculate total score from activities
  const calculateTotalScore = (dto: DeedScoreAverageDto) => {
    if (!dto || !dto.activities) return 0;
    return dto.activities.reduce((sum, act) => sum + act.averageValue, 0);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const baseParams = {
          ...weekParams,
          ...(campusId !== null ? { campusId } : {})
        };

        // 1. Fetch Gender Averages in parallel
        const [ikhwanSummary, akhwatSummary] = await Promise.all([
          deedScoreApi.getAverage({ ...baseParams, gender: 'PRIA' }),
          deedScoreApi.getAverage({ ...baseParams, gender: 'WANITA' })
        ]);

        setIkhwanScore(calculateTotalScore(ikhwanSummary));
        setIkhwanActivities(ikhwanSummary.activities || []);
        
        setAkhwatScore(calculateTotalScore(akhwatSummary));
        setAkhwatActivities(akhwatSummary.activities || []);

        // 2. Fetch Grade Averages (Grade 1 - 5) in parallel
        const grades = [1, 2, 3, 4, 5];
        const gradePromises = grades.map(async (gradeVal) => {
          const summary = await deedScoreApi.getAverage({ ...baseParams, grade: gradeVal });
          return {
            name: `Kelas ${gradeVal}`,
            score: Math.round(calculateTotalScore(summary) * 10) / 10,
            activities: summary.activities || []
          };
        });
        const gradeResults = await Promise.all(gradePromises);
        setGradeData(gradeResults);

        // 3. Fetch Campus Averages (if Super Admin & no specific campus selected)
        if (showCampusChart) {
          const campuses = await campusesApi.getCampuses();
          const campusPromises = campuses.map(async (campus) => {
            const summary = await deedScoreApi.getAverage({ ...weekParams, campusId: campus.id });
            return {
              name: campus.name,
              score: Math.round(calculateTotalScore(summary) * 10) / 10,
              activities: summary.activities || []
            };
          });
          const campusResults = await Promise.all(campusPromises);
          // Sort by score descending
          campusResults.sort((a, b) => b.score - a.score);
          setCampusData(campusResults);
        } else {
          setCampusData([]);
        }
      } catch (error) {
        console.error('Failed to fetch deed score average data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId, weekParams, showCampusChart]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartItem;
      return (
        <div className="bg-card p-3 border border-border rounded-lg shadow-md text-xs space-y-1.5 min-w-[150px]">
          <p className="font-semibold text-sm text-foreground">{data.name}</p>
          <div className="text-primary font-bold text-sm">
            Rata-rata Skor: {data.score.toFixed(1)}
          </div>
          {data.activities && data.activities.length > 0 && (
            <div className="border-t border-border mt-1 pt-1.5 space-y-1 text-muted-foreground">
              {data.activities.map((act) => (
                <div key={act.deedActivityId} className="flex justify-between gap-4">
                  <span>{act.activityName}</span>
                  <span className="font-medium text-foreground">
                    {act.averageValue.toFixed(1)} {act.unit}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 2 Stat Cards for Gender Deed Scores */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Skor Ibadah Ikhwan</CardTitle>
            </div>
            <UserIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">
                  {ikhwanScore !== null ? ikhwanScore.toFixed(1) : '-'}
                </div>
                {ikhwanActivities.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border/50">
                    {ikhwanActivities.slice(0, 3).map((act) => (
                      <div key={act.deedActivityId} className="flex justify-between">
                        <span>{act.activityName}</span>
                        <span>{act.averageValue.toFixed(1)} {act.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-secondary/20 shadow-sm bg-gradient-to-br from-card to-secondary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Rata-rata Skor Ibadah Akhwat</CardTitle>
            </div>
            <UserCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">
                  {akhwatScore !== null ? akhwatScore.toFixed(1) : '-'}
                </div>
                {akhwatActivities.length > 0 && (
                  <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t border-border/50">
                    {akhwatActivities.slice(0, 3).map((act) => (
                      <div key={act.deedActivityId} className="flex justify-between">
                        <span>{act.activityName}</span>
                        <span>{act.averageValue.toFixed(1)} {act.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
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
              <CardTitle className="text-lg font-semibold text-foreground">Rata-rata Skor per Kampus</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
                  <Skeleton className="w-12 h-[160px]" />
                  <Skeleton className="w-12 h-[200px]" />
                  <Skeleton className="w-12 h-[140px]" />
                  <Skeleton className="w-12 h-[230px]" />
                  <Skeleton className="w-12 h-[110px]" />
                </div>
              ) : campusData.length === 0 ? (
                <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
                  Tidak ada data skor per kampus
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
                        tickFormatter={(value) => `${value}`}
                      />
                      <Tooltip 
                        content={<CustomTooltip />}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
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
            <CardTitle className="text-lg font-semibold text-foreground">Rata-rata Skor per Jenjang (Grade)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-end gap-2 h-[260px] pb-6">
                <Skeleton className="w-12 h-[140px]" />
                <Skeleton className="w-12 h-[170px]" />
                <Skeleton className="w-12 h-[150px]" />
                <Skeleton className="w-12 h-[210px]" />
                <Skeleton className="w-12 h-[120px]" />
              </div>
            ) : gradeData.length === 0 ? (
              <div className="flex justify-center items-center h-[260px] text-muted-foreground text-sm">
                Tidak ada data skor per jenjang
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
                      dataKey="name" 
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
                      content={<CustomTooltip />}
                    />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
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
