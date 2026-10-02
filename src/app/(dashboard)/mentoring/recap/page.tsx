"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "../../../../hooks/use-auth"
import { mentoringApi, MentoringRecapParams } from "../../../../lib/api/mentoring"
import { teamsApi } from "../../../../lib/api/teams"
import { weeksApi } from "../../../../lib/api/weeks"
import { MentoringAttendanceRecapDto, TeamDto, WeekDto } from "../../../../types/api"
import { CampusFilter } from "../../../../components/shared/campus-filter"
import { RecapTable } from "../../../../components/mentoring/recap-table"
import { Pagination } from "../../../../components/shared/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Button } from "../../../../components/ui/button"
import { downloadExcel } from "../../../../lib/download"
import { toast } from "sonner"
import { Users, CheckCircle, AlertTriangle, Activity, Download } from "lucide-react"

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

  // Pagination States
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Summary States (agregat seluruh data, bukan per halaman)
  const [summaryTotal, setSummaryTotal] = useState(0)
  const [summaryAverage, setSummaryAverage] = useState(0)
  const [summaryPassing, setSummaryPassing] = useState(0)
  const [summaryAttention, setSummaryAttention] = useState(0)
  
  // Loading States
  const [isLoadingRecaps, setIsLoadingRecaps] = useState(false)
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Fetch filter options (weeks and teams based on campus)
  useEffect(() => {
    const fetchWeeksAndTeams = async () => {
      setIsLoadingFilterData(true)
      try {
        // Fetch current week first
        const curWeek = await weeksApi.getCurrentWeek()
        setCurrentWeek(curWeek)
        
        // Fetch weeks from API based on date range (last 2 months)
        const today = new Date()
        const twoMonthsAgo = new Date()
        twoMonthsAgo.setMonth(today.getMonth() - 2)

        const startDateStr = twoMonthsAgo.toISOString().split('T')[0]
        const endDateStr = today.toISOString().split('T')[0]

        const weeksList = await weeksApi.getWeeksByDateRange(startDateStr, endDateStr)
        // Sort weeks descending so latest week is shown first in dropdown
        weeksList.sort((a, b) => b.weekNumber - a.weekNumber)
        setWeeks(weeksList)
        
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

  // Reset to first page when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0)
  }, [selectedCampus, selectedGender, selectedTeam, selectedWeek, size])

  // Fetch mentoring recap data on filter change
  useEffect(() => {
    const fetchRecap = async () => {
      if (weeks.length === 0) return
      setIsLoadingRecaps(true)
      try {
        const campusId = !isSuperAdmin ? myCampusId : selectedCampus
        
        const params: Partial<MentoringRecapParams> = {}
        if (campusId) params.campusId = campusId
        if (selectedGender !== "ALL") params.gender = selectedGender as "PRIA" | "WANITA"
        if (selectedTeam !== "ALL") params.teamId = Number(selectedTeam)

        // Mapping parameters based on selectedWeek (hybrid approach)
        if (selectedWeek !== "ALL") {
          // Pekan spesifik → gunakan weekIds (presisi)
          params.weekIds = [Number(selectedWeek)]
        } else if (weeks.length > 0) {
          // Semua Pekan → gunakan startDate/endDate dari data weeks API
          const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber)
          params.startDate = sortedWeeks[0].startDate
          params.endDate = sortedWeeks[sortedWeeks.length - 1].endDate
        }

        const [data, summary] = await Promise.all([
          mentoringApi.getMentoringRecap({ ...params, page, size } as MentoringRecapParams),
          mentoringApi.getRecapSummary(params),
        ])

        setRecaps(data.content || [])
        setTotalPages(data.totalPages ?? 0)
        setTotalElements(data.totalElements ?? 0)

        setSummaryTotal(summary.totalCustomers ?? 0)
        setSummaryAverage(summary.averageAttendancePercentage ?? 0)
        setSummaryPassing(summary.passingCount ?? 0)
        setSummaryAttention(summary.attentionCount ?? 0)
      } catch (error) {
        console.error("Failed to fetch mentoring recap", error)
        toast.error("Gagal memuat data rekap mentoring")
      } finally {
        setIsLoadingRecaps(false)
      }
    }

    fetchRecap()
  }, [selectedCampus, selectedGender, selectedTeam, selectedWeek, isSuperAdmin, myCampusId, weeks, page, size])

  // Reset team filter when campus filter changes
  const handleCampusChange = (campusId: number | null) => {
    setSelectedCampus(campusId)
    setSelectedTeam("ALL")
  }

  const handleExport = async () => {
    setIsExporting(true)
    const toastId = toast.loading("Menyiapkan file Excel...")
    try {
      const campusId = !isSuperAdmin ? myCampusId : selectedCampus
      const params: Record<string, unknown> = {}
      if (campusId) params.campusId = campusId
      if (selectedGender !== "ALL") params.gender = selectedGender
      if (selectedTeam !== "ALL") params.teamId = Number(selectedTeam)

      if (selectedWeek !== "ALL") {
        params.weekIds = [Number(selectedWeek)]
      } else if (weeks.length > 0) {
        const sortedWeeks = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber)
        params.startDate = sortedWeeks[0].startDate
        params.endDate = sortedWeeks[sortedWeeks.length - 1].endDate
      }

      await downloadExcel(
        "/api/v1/mentoring/recap/export",
        params,
        `rekap_mentoring_${new Date().toISOString().split('T')[0]}.xlsx`
      )
      toast.success("File Excel berhasil diunduh", { id: toastId })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunduh file Excel", { id: toastId })
    } finally {
      setIsExporting(false)
    }
  }

  // Stats diambil dari summary endpoint (agregat seluruh data, bukan hanya halaman aktif)
  const totalParticipants = summaryTotal
  const averageAttendance = summaryAverage
  const passingCount = summaryPassing
  const attentionCount = summaryAttention

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
              <Select value={selectedGender} onValueChange={(val) => setSelectedGender(val || "ALL")} items={{ ALL: "Semua Gender", PRIA: "Ikhwan (Pria)", WANITA: "Akhwat (Wanita)" }}>
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
              <Select
                value={selectedTeam}
                onValueChange={(val) => setSelectedTeam(val || "ALL")}
                disabled={isLoadingFilterData}
                items={{
                  ALL: "Semua Tim",
                  ...Object.fromEntries(teams.map((t) => [String(t.id), t.name])),
                }}
              >
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
              <Select
                value={selectedWeek}
                onValueChange={(val) => setSelectedWeek(val || "ALL")}
                items={{
                  ALL: "Semua Pekan (2 bulan terakhir)",
                  ...Object.fromEntries(weeks.map((w) => [
                    String(w.id),
                    `Pekan ${w.weekNumber} (${w.startDate} s.d. ${w.endDate})`,
                  ])),
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Semua Pekan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Pekan (2 bulan terakhir)</SelectItem>
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
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Daftar Kehadiran</h2>
            <Button
              onClick={handleExport}
              disabled={isExporting || isLoadingRecaps}
              variant="outline"
              size="sm"
              className="shadow-sm"
            >
              <Download className={`h-4 w-4 mr-2 ${isExporting ? "animate-pulse" : ""}`} />
              Export Excel
            </Button>
          </div>
          {currentWeek && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
              Pekan Berjalan: {selectedWeek === "ALL"
                ? (() => {
                    if (weeks.length === 0) return `Pekan ${currentWeek.weekNumber}`;
                    const sorted = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);
                    return `Semua (${weeks.length} pekan) · ${sorted[0].startDate} s.d. ${sorted[sorted.length - 1].endDate}`;
                  })()
                : (() => {
                    const w = weeks.find(w => String(w.id) === selectedWeek);
                    return w 
                      ? `Pekan ${w.weekNumber} · ${w.startDate} s.d. ${w.endDate}` 
                      : `Pekan ${currentWeek.weekNumber}`;
                  })()
              }
            </span>
          )}
        </div>
        <RecapTable data={recaps} isLoading={isLoadingRecaps} />
        <Pagination
          page={page}
          pageSize={size}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
          onPageSizeChange={setSize}
          isLoading={isLoadingRecaps}
        />
      </div>
    </div>
  )
}
