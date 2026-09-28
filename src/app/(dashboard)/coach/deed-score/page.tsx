"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { DeedScoreAverageDto } from "../../../../types/api"
import { Card, CardContent } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { toast } from "sonner"

const calculateTotalScore = (dto: DeedScoreAverageDto): number => {
  if (!dto || !dto.activities) return 0
  return dto.activities.reduce((sum, act) => sum + act.averageValue, 0)
}

export default function CoachDeedScorePage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [data, setData] = useState<DeedScoreAverageDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await coachDataApi.getDeedScoreAverage()
      setData(result)
    } catch (error) {
      console.error("Failed to fetch deed score average", error)
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
          Rata-rata skor amalan yaumiyah tim yang Anda bina.
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
            Belum ada data amalan untuk tim Anda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((dto, idx) => {
            const total = calculateTotalScore(dto)
            return (
              <Card key={idx} className="border-border/60 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">
                      {dto.campusName || "Tim"}
                      {dto.grade ? ` · Grade ${dto.grade}` : ""}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {dto.totalCustomers} peserta
                    </Badge>
                  </div>

                  <div className="mt-3 text-3xl font-extrabold text-primary">
                    {total.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Rata-rata Skor</div>

                  {dto.activities && dto.activities.length > 0 && (
                    <div className="mt-4 space-y-1 border-t border-border pt-3">
                      {dto.activities.map((act) => (
                        <div
                          key={act.deedActivityId}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-muted-foreground">{act.activityName}</span>
                          <span className="font-medium text-foreground">
                            {act.averageValue.toFixed(1)} {act.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}