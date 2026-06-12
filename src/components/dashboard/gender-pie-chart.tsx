"use client";

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { customersApi } from '../../lib/api/customers';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface GenderPieChartProps {
  campusId: number | null;
}

export function GenderPieChart({ campusId }: GenderPieChartProps) {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const baseParams = campusId ? { campusId } : {};
        
        const [priaCount, wanitaCount] = await Promise.all([
          customersApi.getCustomerCount({ ...baseParams, gender: 'PRIA' }),
          customersApi.getCustomerCount({ ...baseParams, gender: 'WANITA' })
        ]);

        setData([
          { name: 'Ikhwan (Pria)', value: priaCount },
          { name: 'Akhwat (Wanita)', value: wanitaCount }
        ]);
      } catch (error) {
        console.error('Failed to fetch gender data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [campusId]);

  // Design Tokens PRD §8 - Primary: #2D7A4F, Secondary: #4A9D6F
  const COLORS = ['#2D7A4F', '#4A9D6F'];

  return (
    <Card className="col-span-1 border-primary/10 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Rasio Gender Peserta</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Skeleton className="h-[250px] w-[250px] rounded-full" />
          </div>
        ) : data.every(d => d.value === 0) ? (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground text-sm">
            Tidak ada data peserta
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Total']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
