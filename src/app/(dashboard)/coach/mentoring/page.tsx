"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { MentoringAttendanceRecapDto } from "../../../../types/api"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { toast } from "sonner"

export default function CoachMentoringPage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [data, setData] = useState<MentoringAttendanceRecapDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await coachDataApi.getMentoringRecap()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch mentoring recap", error)
      toast.error("Gagal memuat rekap mentoring")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [isAuthorized, fetchData])

  if (!isAuthorized) return null

  const columns: ColumnDef<MentoringAttendanceRecapDto>[] = [
    { header: "Minggu", render: (row) => <span className="text-sm">{row.weekLabel}</span> },
    { header: "Tim", render: (row) => <span className="font-medium">{row.teamName}</span> },
    {
      header: "Kehadiran",
      render: (row) => (
        <span className="text-sm">
          {row.totalAttendance} / {row.totalCustomers} peserta
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Rekap Mentoring</h1>
        <p className="text-muted-foreground mt-1">Rekap kehadiran sesi mentoring tim yang Anda bina.</p>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="Belum ada data mentoring untuk tim Anda."
      />
    </div>
  )
}