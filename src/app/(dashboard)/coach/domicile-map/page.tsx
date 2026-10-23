"use client"

import React, { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { RegionDistribution, TeamSummaryDto } from "../../../../types/api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select"
import { toast } from "sonner"

const RegionMap = dynamic(
  () =>
    import("../../../../components/dashboard/region-map").then(
      (module) => module.RegionMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full animate-pulse rounded-xl bg-muted/20" />
    ),
  }
)

export default function CoachDomicileMapPage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [teams, setTeams] = useState<TeamSummaryDto[]>([])
  const [selectedTeam, setSelectedTeam] = useState("ALL")
  const [points, setPoints] = useState<RegionDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const teamList = await coachDataApi.getMyTeams()
      setTeams(teamList)

      const teamId =
        teamList.length === 1
          ? teamList[0].id
          : selectedTeam === "ALL"
            ? undefined
            : Number(selectedTeam)

      const result = await coachDataApi.getRegionDistribution(teamId)
      setPoints(
        result.filter((point) => point.latitude != null && point.longitude != null)
      )
    } catch (error) {
      console.error("Failed to fetch coach region distribution", error)
      toast.error("Gagal memuat peta domisili")
    } finally {
      setIsLoading(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    if (!isAuthorized) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [isAuthorized, fetchData])

  if (!isAuthorized) return null

  const teamItems: Record<string, string> = {
    ALL: "Semua Tim",
    ...Object.fromEntries(teams.map((team) => [String(team.id), team.name])),
  }

  const selectedTeamName =
    teams.length === 1
      ? teams[0]?.name
      : selectedTeam === "ALL"
        ? "Semua Tim"
        : teams.find((team) => String(team.id) === selectedTeam)?.name

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Peta Domisili Tim
          </h1>
          <p className="text-muted-foreground mt-1">
            Sebaran domisili peserta pada tim yang Anda bina.
          </p>
        </div>

        {teams.length > 1 && (
          <div className="w-full sm:w-[280px]">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Filter tim
            </label>
            <Select
              value={selectedTeam}
              onValueChange={(value) => setSelectedTeam(value ?? "ALL")}
              items={teamItems}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Tim</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={String(team.id)}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {teams.length === 1 && (
          <p className="text-sm text-muted-foreground">
            Tim: <span className="font-medium text-foreground">{teams[0].name}</span>
          </p>
        )}
      </div>

      <RegionMap
        points={points}
        isLoading={isLoading}
        title={`Sebaran Domisili Peserta (${selectedTeamName ?? "Semua Tim"})`}
        emptyMessage="Belum ada data domisili pada tim Anda."
      />
    </div>
  )
}
