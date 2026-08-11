"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { customersApi } from '../../lib/api/customers';
import { CustomerFilterParams } from '../../types/api';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface EntryYearBarChartProps {
  campusId: number | null;
}

export function EntryYearBarChart({ campusId }: EntryYearBarChartProps) {
  const [data, setData] = useState<{ year: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentYear = new Date().getFullYear();
        // Generate last 5 years: e.g., 2022, 2023, 2024, 2025, 2026
        const years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
        
        const countPromises = years.map(async (year) => {
          const params: CustomerFilterParams = { entryYear: year };
          if (campusId !== null) {
            params.campusId = campusId;
          }
          const total = await customersApi.getCustomerCount(params);
          return { year: year.toString(), total };
        });

        const results = await Promise.all(countPromises);
        setData(results);
      } catch (error) {
        console.error('Failed to fetch entry year distribution data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId]);

  return (
    <Card className="col-span-1 border-primary/10 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Distribusi Mahasiswa per Angkatan</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-end gap-2 h-[300px] pb-6">
            <Skeleton className="w-10 h-[80px]" />
            <Skeleton className="w-10 h-[120px]" />
            <Skeleton className="w-10 h-[180px]" />
            <Skeleton className="w-10 h-[220px]" />
            <Skeleton className="w-10 h-[280px]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground text-sm">
            Tidak ada data distribusi angkatan
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
                  formatter={(value) => [value, 'Total Mahasiswa']}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
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
