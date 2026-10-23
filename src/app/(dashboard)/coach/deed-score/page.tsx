"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { CoachDeedScoreMemberDto } from "../../../../types/api"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { toast } from "sonner"

const formatValue = (value: number): string =>
  Number(value).toLocaleString("id-ID", { maximumFractionDigits: 2 })

export default function CoachDeedScorePage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [data, setData] = useState<CoachDeedScoreMemberDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await coachDataApi.getDeedScoreMembers()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch deed score members", error)
      toast.error("Gagal memuat rekap amalan")
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Rekap Amalan Tim</h1>
        <p className="text-muted-foreground mt-1">
          Rekap amalan yaumiyah per peserta pada tim yang Anda bina.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-5 space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-6 text-sm text-muted-foreground">
            Belum ada peserta pada tim Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((member) => (
            <Card key={member.customerId} className="border-border/60 shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {member.customerName}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {member.teamName || "Tanpa tim"}
                      {member.grade ? ` · Grade ${member.grade}` : ""}
                    </div>
                  </div>
                  <Badge
                    variant={member.activities.length > 0 ? "secondary" : "outline"}
                    className="shrink-0 text-xs"
                  >
                    {member.activities.length > 0 ? "Sudah mengisi" : "Belum mengisi"}
                  </Badge>
                </div>

                <div className="mt-3 text-3xl font-extrabold text-primary">
                  {(Number(member.totalScore ?? 0) * 100).toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Total Poin (skala 0–100)</div>

                {member.activities.length > 0 ? (
                  <div className="mt-4 space-y-1 border-t border-border pt-3">
                    {member.activities.map((act) => (
                      <div
                        key={act.deedActivityId}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="text-muted-foreground">{act.activityName}</span>
                        <span className="shrink-0 text-right font-medium text-foreground">
                          {formatValue(act.value)} {act.unit ?? ""}
                          <span className="ml-1 text-muted-foreground">
                            ({(Number(act.score ?? 0) * 100).toFixed(0)} poin)
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                    Belum ada amalan pada periode ini.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
