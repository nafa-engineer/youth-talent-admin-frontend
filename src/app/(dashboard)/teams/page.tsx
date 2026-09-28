"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuth } from "../../../hooks/use-auth"
import { teamsApi } from "../../../lib/api/teams"
import { TeamDto } from "../../../types/api"
import { CampusFilter } from "../../../components/shared/campus-filter"
import { TeamList } from "../../../components/teams/team-list"
import { TeamFormModal } from "../../../components/teams/team-form-modal"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card, CardContent } from "../../../components/ui/card"
import { toast } from "sonner"
import { Plus, Search } from "lucide-react"

export default function TeamsPage() {
  const { isSuperAdmin, getCampusId } = useAuth()
  const myCampusId = getCampusId()

  // Filter States
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Data States
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<TeamDto | null>(null)

  // Debounce search (server-side search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchTeams = useCallback(async () => {
    setIsLoading(true)
    try {
      const campusId = !isSuperAdmin ? myCampusId : selectedCampus
      const params: { campusId?: number; search?: string } = {}
      if (campusId) params.campusId = campusId
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim()
      const data = await teamsApi.getTeams(Object.keys(params).length ? params : undefined)
      setTeams(data)
    } catch (error) {
      console.error("Failed to fetch teams list", error)
      toast.error("Gagal memuat daftar tim")
    } finally {
      setIsLoading(false)
    }
  }, [selectedCampus, isSuperAdmin, myCampusId, debouncedSearch])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeams()
  }, [fetchTeams])

  const handleCreateNewTeam = () => {
    setSelectedTeamForEdit(null)
    setIsFormModalOpen(true)
  }

  const handleEditTeam = (team: TeamDto) => {
    setSelectedTeamForEdit(team)
    setIsFormModalOpen(true)
  }

  const handleDeleteTeam = async (team: TeamDto) => {
    // Logging ID agar variabel team tidak terdeteksi unused oleh TypeScript linter
    console.log("Delete attempted for team:", team.id)
    toast.info("Fitur ini belum tersedia")
  }

  // Client-side search removed: pencarian kini diproses di backend (param `search`).

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
            Manajemen Tim / Halaqah
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola pembagian grup halaqah peserta mentoring Anda.
          </p>
        </div>

        <Button onClick={handleCreateNewTeam} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all">
          <Plus className="mr-2 h-4 w-4" /> Tambah Tim
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau kode tim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>

            {/* Campus Filter */}
            <div className="w-full sm:w-64">
              <CampusFilter value={selectedCampus} onChange={setSelectedCampus} className="w-full h-9" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid List */}
      <TeamList
        teams={teams}
        isLoading={isLoading}
        onEdit={handleEditTeam}
        onDelete={handleDeleteTeam}
      />

      {/* Team Create/Edit Form Modal */}
      <TeamFormModal
        open={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        team={selectedTeamForEdit}
        onSuccess={fetchTeams}
      />
    </div>
  )
}
