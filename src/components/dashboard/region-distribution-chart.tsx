"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { customersApi } from "../../lib/api/customers";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

interface RegionDistributionChartProps {
  campusId: number | null;
}

export function RegionDistributionChart({ campusId }: RegionDistributionChartProps) {
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const params = campusId ? { campusId } : undefined;
        const result = await customersApi.getDistribution("province", params);
        setData(
          result
            .slice(0, 15)
            .map((r) => ({ name: r.name, total: r.count }))
        );
      } catch (error) {
        console.error("Failed to fetch region distribution", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [campusId]);

  return (
    <Card className="border-primary/10 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Sebaran Domisili per Provinsi</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-end gap-2 h-[300px] pb-6">
            <Skeleton className="w-12 h-[120px]" />
            <Skeleton className="w-12 h-[220px]" />
            <Skeleton className="w-12 h-[170px]" />
            <Skeleton className="w-12 h-[260px]" />
            <Skeleton className="w-12 h-[140px]" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex justify-center items-center h-[300px] text-muted-foreground text-sm">
            Belum ada data domisili peserta
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  cursor={{ fill: "#e4e6eb" }}
                  contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  formatter={(value) => [value, "Jumlah Peserta"]}
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
