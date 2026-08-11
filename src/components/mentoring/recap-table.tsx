"use client"

import * as React from "react"
import { DataTable, ColumnDef } from "../shared/data-table"
import { MentoringAttendanceRecapDto } from "../../types/api"

interface RecapTableProps {
  data: MentoringAttendanceRecapDto[]
  isLoading?: boolean
}

export function RecapTable({ data, isLoading = false }: RecapTableProps) {
  const columns: ColumnDef<MentoringAttendanceRecapDto>[] = [
    {
      header: "No",
      className: "w-[60px] text-center font-medium text-muted-foreground",
      render: (_, index) => index + 1,
    },
    {
      header: "Nama Peserta",
      accessorKey: "customerName",
      className: "font-semibold text-foreground min-w-[150px]",
    },
    {
      header: "Gender",
      className: "w-[120px]",
      render: (row) => {
        const isPria = row.gender === "PRIA"
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isPria
                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400"
                : "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400"
            }`}
          >
            {isPria ? "Ikhwan (Pria)" : "Akhwat (Wanita)"}
          </span>
        )
      },
    },
    {
      header: "Tim",
      accessorKey: "teamName",
      render: (row) => row.teamName || <span className="text-muted-foreground italic">Belum Ada Tim</span>,
    },
    {
      header: "Kampus",
      accessorKey: "campusName",
      render: (row) => row.campusName || <span className="text-muted-foreground italic">-</span>,
    },
    {
      header: "Kehadiran",
      className: "w-[120px] text-center",
      render: (row) => `${row.totalAttendance} / ${row.totalSessions}`,
    },
    {
      header: "Persentase",
      className: "w-[120px] text-center font-bold",
      render: (row) => {
        const percentage = row.totalSessions > 0 
          ? (row.totalAttendance / row.totalSessions) * 100 
          : 0
        
        const isSuccess = percentage >= 80

        return (
          <span
            className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
              isSuccess
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50"
            }`}
          >
            {percentage.toFixed(1)}%
          </span>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      skeletonRows={8}
      emptyMessage="Tidak ada data rekap mentoring untuk filter yang dipilih."
    />
  )
}
