"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useAuth } from "../../../hooks/use-auth"
import { leaderboardApi } from "../../../lib/api/leaderboard"
import { deedActivitiesApi } from "../../../lib/api/deed-activities"
import { weeksApi } from "../../../lib/api/weeks"
import { DeedLeaderboardResponseDto, DeedActivityDto, WeekDto } from "../../../types/api"
import { CampusFilter } from "../../../components/shared/campus-filter"
import { LeaderboardTable } from "../../../components/leaderboard/leaderboard-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { Card, CardContent } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { toast } from "sonner"
import { RefreshCw, Calendar, Award, MapPin } from "lucide-react"

export default function LeaderboardPage() {
  const { isSuperAdmin, getCampusId } = useAuth()
  const myCampusId = getCampusId()

  // Filter States
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<string>("")
  const [selectedActivity, setSelectedActivity] = useState<string>("GLOBAL")

  // Data States
  const [leaderboardData, setLeaderboardData] = useState<DeedLeaderboardResponseDto | null>(null)
  const [weeks, setWeeks] = useState<WeekDto[]>([])
  const [activities, setActivities] = useState<DeedActivityDto[]>([])
  
  // Loading States
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingFilterData, setIsLoadingFilterData] = useState(false)

  // Fetch weeks and deed activities on load
  useEffect(() => {
    const fetchInitData = async () => {
      setIsLoadingFilterData(true)
      try {
        // Fetch current week first
        const curWeek = await weeksApi.getCurrentWeek()

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

        // Set current week as default
        if (curWeek) {
          setSelectedWeek(String(curWeek.id))
        } else if (weeksList.length > 0) {
          setSelectedWeek(String(weeksList[0].id))
        }

        const actsData = await deedActivitiesApi.getDeedActivities()
        setActivities(actsData)
      } catch (error) {
        console.error("Failed to load initial leaderboard filter data", error)
        toast.error("Gagal memuat parameter klasemen")
      } finally {
        setIsLoadingFilterData(false)
      }
    }

    fetchInitData()
  }, [])

  // Fetch leaderboard data when filters change
  const fetchLeaderboard = useCallback(async () => {
    if (!selectedWeek) return
    
    setIsLoadingData(true)
    try {
      const campusId = !isSuperAdmin ? myCampusId : selectedCampus
      const params = {
        weekId: selectedWeek,
        ...(campusId ? { campusId } : {})
      }

      let data: DeedLeaderboardResponseDto
      if (selectedActivity === "GLOBAL") {
        data = await leaderboardApi.getGlobalLeaderboard(params)
      } else {
        data = await leaderboardApi.getActivityLeaderboard(Number(selectedActivity), params)
      }

      setLeaderboardData(data)
    } catch (error) {
      console.error("Failed to fetch leaderboard details", error)
      toast.error("Gagal memuat data klasemen")
    } finally {
      setIsLoadingData(false)
    }
  }, [selectedCampus, selectedWeek, selectedActivity, isSuperAdmin, myCampusId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard()
  }, [fetchLeaderboard])

  // Generate Leaderboard (Available to ALL Admins)
  const handleGenerateLeaderboard = async () => {
    if (!selectedWeek) return
    
    setIsGenerating(true)
    const toastId = toast.loading("Sedang menghitung ulang klasemen...")
    try {
      const response = await leaderboardApi.generateLeaderboard(Number(selectedWeek))
      toast.success(`Leaderboard diperbarui! ${response.count} peserta diproses.`, { id: toastId })
      
      // Re-fetch data
      await fetchLeaderboard()
    } catch (error) {
      console.error("Failed to generate leaderboard", error)
      toast.error("Gagal memproses ulang klasemen", { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  // Format generated time
  const formatGeneratedAt = (isoString?: string) => {
    if (!isoString) return "-"
    try {
      const date = new Date(isoString)
      return date.toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "medium"
      })
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text">
            Klasemen & Leaderboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Lihat pencapaian amal harian peserta secara nasional maupun per-kampus.
          </p>
        </div>

        <Button
          onClick={handleGenerateLeaderboard}
          disabled={isGenerating || isLoadingFilterData || !selectedWeek}
          className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
          Hitung Ulang Klasemen
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Kampus */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" /> Kampus
              </label>
              <CampusFilter value={selectedCampus} onChange={setSelectedCampus} className="w-full" />
            </div>

            {/* Pekan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" /> Pekan
              </label>
              <Select 
                value={selectedWeek} 
                onValueChange={(val) => setSelectedWeek(val || "")}
                disabled={isLoadingFilterData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFilterData ? "Memuat..." : "Pilih Pekan"} />
                </SelectTrigger>
                <SelectContent>
                  {weeks.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      Pekan {w.weekNumber} ({w.startDate} s.d. {w.endDate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Kategori Amal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-3 w-3 text-muted-foreground" /> Kategori Klasemen
              </label>
              <Select 
                value={selectedActivity} 
                onValueChange={(val) => setSelectedActivity(val || "GLOBAL")}
                disabled={isLoadingFilterData}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingFilterData ? "Memuat..." : "Pilih Kategori"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Klasemen Umum (Global)</SelectItem>
                  {activities.map((act) => (
                    <SelectItem key={act.id} value={String(act.id)}>
                      {act.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta data update & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">
            {selectedActivity === "GLOBAL" ? "Klasemen Umum" : "Klasemen Kategori"}
          </h2>
          {leaderboardData && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md border border-border/50">
              Terakhir Diperbarui: <span className="font-semibold text-foreground">{formatGeneratedAt(leaderboardData.generatedAt)}</span>
            </span>
          )}
        </div>

        <LeaderboardTable 
          data={leaderboardData?.items || []} 
          isLoading={isLoadingData} 
        />
      </div>
    </div>
  )
}
