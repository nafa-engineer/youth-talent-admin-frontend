"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "../../../../hooks/use-auth"
import { mentoringApi, MentoringRecapParams } from "../../../../lib/api/mentoring"
import { teamsApi } from "../../../../lib/api/teams"
import { weeksApi } from "../../../../lib/api/weeks"
import { MentoringAttendanceRecapDto, TeamDto, WeekDto } from "../../../../types/api"
import { CampusFilter } from "../../../../components/shared/campus-filter"
import { RecapTable } from "../../../../components/mentoring/recap-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { toast } from "sonner"
import { Users, CheckCircle, AlertTriangle, Activity } from "lucide-react"

export default function MentoringRecapPage() {
  const { isSuperAdmin, getCampusId } = useAuth()
  const myCampusId = getCampusId()
  
  // Filter States
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [selectedGender, setSelectedGender] = useState<string>("ALL")
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL")
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL")

  // Data States
  const [recaps, setRecaps] = useState<MentoringAttendanceRecapDto[]>([])
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [weeks, setWeeks] = useState<WeekDto[]>([])
  const [currentWeek, setCurrentWeek] = useState<WeekDto | null>(null)
  
  // Loading States
  const [isLoadingRecaps, setIsLoadingRecaps] = useState(false)
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(false)

  // Fetch filter options (weeks and teams based on campus)
  useEffect(() => {
    const fetchWeeksAndTeams = async () => {
      setIsLoadingFilterData(true)
      try {
        // Fetch current week first
        const curWeek = await weeksApi.getCurrentWeek()
        setCurrentWeek(curWeek)
        
        // Fetch all weeks (represented by mock list, or hardcoded for select list)
        // Since mock api returns current week, let's also define standard weeks
        // In real backend we would query all weeks or current week detail.
        // We'll mock weeks 1, 2, 3 in setup.
        setWeeks([
          { id: 1, year: 2026, weekNumber: 23, startDate: '2026-06-08', endDate: '2026-06-14' },
          { id: 2, year: 2026, weekNumber: 24, startDate: '2026-06-15', endDate: '2026-06-21' },
          { id: 3, year: 2026, weekNumber: 25, startDate: '2026-06-22', endDate: '2026-06-28' },
        ])
        
        // Fetch teams based on campus
        const campusIdToFetch = !isSuperAdmin ? myCampusId : selectedCampus
        const teamsData = await teamsApi.getTeams(campusIdToFetch ? { campusId: campusIdToFetch } : undefined)
        setTeams(teamsData)
      } catch (error) {
        console.error("Failed to fetch filter options", error)
        toast.error("Gagal memuat opsi filter")
      } finally {
        setIsLoadingFilterData(false)
      }
    }

    fetchWeeksAndTeams()
  }, [selectedCampus, isSuperAdmin, myCampusId])

  // Fetch mentoring recap data on filter change
  useEffect(() => {
    const fetchRecap = async () => {
      setIsLoadingRecaps(true)
      try {
        const campusId = !isSuperAdmin ? myCampusId : selectedCampus
        
        const params: MentoringRecapParams = {}
        if (campusId) params.campusId = campusId
        if (selectedGender !== "ALL") params.gender = selectedGender as "PRIA" | "WANITA"
        if (selectedTeam !== "ALL") params.teamId = Number(selectedTeam)
        if (selectedWeek !== "ALL") params.weekId = Number(selectedWeek)

        const data = await mentoringApi.getMentoringRecap(params)
        setRecaps(data)
      } catch (error) {
        console.error("Failed to fetch mentoring recap", error)
        toast.error("Gagal memuat data rekap mentoring")
      } finally {
        setIsLoadingRecaps(false)
      }
    }

    fetchRecap()
  }, [selectedCampus, selectedGender, selectedTeam, selectedWeek, isSuperAdmin, myCampusId])

  // Reset team filter when campus filter changes
  const handleCampusChange = (campusId: number | null) => {
    setSelectedCampus(campusId)
    setSelectedTeam("ALL")
  }

  // Calculate stats
  const totalParticipants = recaps.length
  
  const averageAttendance = totalParticipants > 0 
    ? (recaps.reduce((acc, curr) => acc + (curr.totalSessions > 0 ? (curr.totalAttendance / curr.totalSessions) : 0), 0) / totalParticipants) * 100
    : 0

  const passingCount = recaps.filter(r => {
    const pct = r.totalSessions > 0 ? (r.totalAttendance / r.totalSessions) * 100 : 0
    return pct >= 80
  }).length

  const attentionCount = totalParticipants - passingCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
          Rekap Kehadiran Mentoring
        </h1>
        <p className="text-muted-foreground mt-1">
          Pantau performa kehadiran mentoring peserta secara keseluruhan beserta metrik kelulusan.
        </p>
      </div>

      {/* Filter Card */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Kampus */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Kampus
              </label>
              <CampusFilter value={selectedCampus} onChange={handleCampusChange} className="w-full" />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Gender
              </label>
              <Select value={selectedGender} onValueChange={(val) => setSelectedGender(val || "ALL")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Gender</SelectItem>
                  <SelectItem value="PRIA">Ikhwan (Pria)</SelectItem>
                  <SelectItem value="WANITA">Akhwat (Wanita)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tim */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tim / Halaqah
              </label>
              <Select value={selectedTeam} onValueChange={(val) => setSelectedTeam(val || "ALL")} disabled={isLoadingFilterData}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFilterData ? "Memuat..." : "Semua Tim"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Tim</SelectItem>
                  {teams.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pekan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pekan
              </label>
              <Select value={selectedWeek} onValueChange={(val) => setSelectedWeek(val || "ALL")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Pekan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Pekan</SelectItem>
                  {weeks.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      Pekan {w.weekNumber} ({w.startDate} s.d. {w.endDate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Peserta */}
        <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Total Peserta Terfilter
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalParticipants}</div>
            <p className="text-xs text-muted-foreground mt-1">orang aktif dalam rekap</p>
          </CardContent>
        </Card>

        {/* Kehadiran Rata-rata */}
        <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Kehadiran Rata-rata
            </CardTitle>
            <Activity className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{averageAttendance.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">rata-rata persentase hadir</p>
          </CardContent>
        </Card>

        {/* Kehadiran >= 80% */}
        <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Kehadiran Lulus (≥80%)
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {passingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalParticipants > 0 ? ((passingCount / totalParticipants) * 100).toFixed(0) : 0}% dari total
            </p>
          </CardContent>
        </Card>

        {/* Kehadiran < 80% */}
        <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Butuh Perhatian (&lt;80%)
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {attentionCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalParticipants > 0 ? ((attentionCount / totalParticipants) * 100).toFixed(0) : 0}% dari total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recap Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">Daftar Kehadiran</h2>
          {currentWeek && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Pekan Berjalan: Pekan {currentWeek.weekNumber}
            </span>
          )}
        </div>
        <RecapTable data={recaps} isLoading={isLoadingRecaps} />
      </div>
    </div>
  )
}
