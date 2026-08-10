"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { DeedScoreAverageDto } from "../../../../types/api"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { toast } from "sonner"

export default function CoachDeedScorePage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [data, setData] = useState<DeedScoreAverageDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await coachDataApi.getDeedScoreAverage()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch deed score average", error)
      toast.error("Gagal memuat rekap amalan")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    fetchData()
  }, [isAuthorized, fetchData])

  if (!isAuthorized) return null

  const columns: ColumnDef<DeedScoreAverageDto>[] = [
    { header: "Minggu", render: (row) => <span className="text-sm">{row.weekLabel}</span> },
    { header: "Tim", render: (row) => <span className="font-medium">{row.teamName}</span> },
    {
      header: "Rata-rata Skor",
      render: (row) => (
        <span className="font-semibold text-primary">
          {Math.round(row.averageScore * 100)} poin
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Rekap Amalan Tim</h1>
        <p className="text-muted-foreground mt-1">Rata-rata skor amalan yaumiyah tim yang Anda bina.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Belum ada data amalan untuk tim Anda."
      />
    </div>
  )
}