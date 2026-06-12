"use client"

import * as React from "react"
import { DataTable, ColumnDef } from "../shared/data-table"
import { DeedLeaderboardItemDto } from "../../types/api"
import { Trophy } from "lucide-react"

interface LeaderboardTableProps {
  data: DeedLeaderboardItemDto[]
  isLoading?: boolean
}

export function LeaderboardTable({ data, isLoading = false }: LeaderboardTableProps) {
  const columns: ColumnDef<DeedLeaderboardItemDto>[] = [
    {
      header: "Peringkat",
      className: "w-[120px] text-center font-bold",
      render: (row) => {
        const rank = row.rank
        if (rank === 1) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-extrabold dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
              <span>🥇</span> 1st
            </span>
          )
        }
        if (rank === 2) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-sm font-extrabold dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800">
              <span>🥈</span> 2nd
            </span>
          )
        }
        if (rank === 3) {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-600/10 text-amber-600 border border-amber-600/20 text-sm font-extrabold dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-900/40">
              <span>🥉</span> 3rd
            </span>
          )
        }
        return <span className="text-muted-foreground">{rank}</span>
      },
    },
    {
      header: "Nama Peserta",
      accessorKey: "customerName",
      className: "font-semibold text-foreground min-w-[150px]",
      render: (row) => {
        const isTop3 = row.rank <= 3
        return (
          <div className="flex items-center gap-2">
            <span>{row.customerName}</span>
            {isTop3 && <Trophy className={`h-3.5 w-3.5 ${
              row.rank === 1 ? "text-amber-500" : row.rank === 2 ? "text-slate-400" : "text-amber-700"
            }`} />}
          </div>
        )
      }
    },
    {
      header: "Tim",
      accessorKey: "teamName",
    },
    {
      header: "Kampus",
      accessorKey: "campusName",
    },
    {
      header: "Skor Total / Frekuensi",
      className: "w-[180px] text-right font-extrabold text-foreground pr-6",
      render: (row) => {
        return (
          <span className="text-primary text-base">
            {row.score.toLocaleString()}
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
      skeletonRows={10}
      emptyMessage="Leaderboard kosong atau belum di-generate."
    />
  )
}
