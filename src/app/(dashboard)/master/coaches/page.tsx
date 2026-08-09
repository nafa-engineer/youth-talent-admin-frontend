"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRoleGuard } from "../../../../hooks/use-role-guard"
import { coachesApi } from "../../../../lib/api/coaches"
import { CoachDto } from "../../../../types/api"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { CoachFormModal } from "../../../../components/master/coaches/coach-form-modal"
import { AssignTeamModal } from "../../../../components/master/coaches/assign-team-modal"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { formatDate } from "../../../../lib/utils"
import { toast } from "sonner"
import { Plus, Search, ShieldAlert, ShieldCheck, Users } from "lucide-react"

export default function CoachesPage() {
  // Enforce Super Admin only
  useRoleGuard(true)

  const [coaches, setCoaches] = useState<CoachDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [isFormOpen, setIsFormOpen] = useState(false)

  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [selectedCoachForAssign, setSelectedCoachForAssign] = useState<CoachDto | null>(null)

  const fetchCoaches = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await coachesApi.getCoaches()
      setCoaches(data)
    } catch (error) {
      console.error("Failed to fetch coaches", error)
      toast.error("Gagal memuat daftar coach")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCoaches()
  }, [fetchCoaches])

  // Keep the assign modal's coach data fresh after assign/unassign
  useEffect(() => {
    if (!selectedCoachForAssign) return
    const updated = coaches.find((c) => c.id === selectedCoachForAssign.id)
    if (updated) setSelectedCoachForAssign(updated)
  }, [coaches, selectedCoachForAssign])

  const handleCreateNew = () => {
    setIsFormOpen(true)
  }

  const handleManageTeams = (coach: CoachDto) => {
    setSelectedCoachForAssign(coach)
    setIsAssignOpen(true)
  }

  const handleToggleActive = async (coach: CoachDto) => {
    const action = coach.isActive ? "menonaktifkan" : "mengaktifkan"
    if (!window.confirm(`Apakah Anda yakin ingin ${action} coach "${coach.name}"?`)) return

    const loaderId = toast.loading(`Sedang ${action} coach...`)
    try {
      if (coach.isActive) {
        await coachesApi.deactivateCoach(coach.id)
      } else {
        await coachesApi.activateCoach(coach.id)
      }
      toast.success(`Coach berhasil di${coach.isActive ? "nonaktifkan" : "aktifkan"}!`, { id: loaderId })
      fetchCoaches()
    } catch (error) {
      console.error("Failed to toggle coach status", error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || `Gagal ${action} coach`, { id: loaderId })
    }
  }

  const filteredCoaches = coaches.filter((c) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      c.teams.some((t) => t.name.toLowerCase().includes(query))
    )
  })

  const columns: ColumnDef<CoachDto>[] = [
    {
      header: "Coach",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Jenis Kelamin",
      render: (row) => <span className="text-sm">{row.gender === "PRIA" ? "Ikhwan" : "Akhwat"}</span>,
    },
    {
      header: "Status Coach",
      render: (row) => (
        <Badge variant={row.isInternal ? "default" : "outline"}>
          {row.isInternal ? "Internal" : "Eksternal"}
        </Badge>
      ),
    },
    {
      header: "Tim Dibina",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {row.teams.length === 0 ? (
            <span className="text-xs text-muted-foreground">Belum ada tim</span>
          ) : (
            row.teams.map((t) => (
              <Badge key={t.id} variant="secondary" className="text-xs">
                {t.name}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-700 border border-rose-500/20"
          }`}
        >
          {row.isActive ? "Aktif" : "Nonaktif"}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Aksi",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleManageTeams(row)}
            className="h-8 w-8 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
            title="Kelola Tim"
          >
            <Users className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(row)}
            className={
              row.isActive
                ? "h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                : "h-8 w-8 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50"
            }
            title={row.isActive ? "Nonaktifkan Coach" : "Aktifkan Coach"}
          >
            {row.isActive ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Manajemen Coach
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola akun coach dan tim yang mereka bina.
          </p>
        </div>

        <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" /> Tambah Coach
        </Button>
      </div>

      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau tim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredCoaches}
        isLoading={isLoading}
        emptyMessage="Tidak ada data coach yang ditemukan."
      />

      <CoachFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchCoaches}
      />

      <AssignTeamModal
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        coach={selectedCoachForAssign}
        onSuccess={fetchCoaches}
      />
    </div>
  )
}