"use client";

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { customersApi } from '../../lib/api/customers';
import { campusesApi } from '../../lib/api/campuses';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export function CampusBarChart() {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const campuses = await campusesApi.getCampuses();
        
        // Fetch count for each campus in parallel
        const countPromises = campuses.map(campus => 
          customersApi.getCustomerCount({ campusId: campus.id })
            .then(total => ({ name: campus.name, total }))
        );
        
        const results = await Promise.all(countPromises);
        
        // Sort by total descending
        results.sort((a, b) => b.total - a.total);
        
        setData(results);
      } catch (error) {
        console.error('Failed to fetch campus distribution data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-2 border-primary/10 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Distribusi Peserta per Kampus</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-end gap-2 h-[300px] pb-6">
            <Skeleton className="w-16 h-[100px]" />
            <Skeleton className="w-16 h-[200px]" />
            <Skeleton className="w-16 h-[150px]" />
            <Skeleton className="w-16 h-[250px]" />
            <Skeleton className="w-16 h-[120px]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground text-sm">
            Tidak ada data distribusi kampus
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#e4e6eb' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                  formatter={(value) => [value, 'Total Peserta']}
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
