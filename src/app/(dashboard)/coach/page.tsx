"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../hooks/use-role-guard"
import { useAuth } from "../../../hooks/use-auth"
import { coachDataApi } from "../../../lib/api/coach-data"
import { TeamSummaryDto, CustomerDto } from "../../../types/api"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { toast } from "sonner"
import { Users, UserCheck } from "lucide-react"

export default function CoachDashboardPage() {
  const { isAuthorized } = useCoachRoleGuard()
  const { getName } = useAuth()

  const [teams, setTeams] = useState<TeamSummaryDto[]>([])
  const [customers, setCustomers] = useState<CustomerDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [teamsData, customersData] = await Promise.all([
        coachDataApi.getMyTeams(),
        coachDataApi.getMyCustomers(),
      ])
      setTeams(teamsData)
      setCustomers(customersData)
    } catch (error) {
      console.error("Failed to fetch coach dashboard data", error)
      toast.error("Gagal memuat data dashboard")
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
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Selamat datang, {getName()}
        </h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan tim yang Anda bina.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tim Dibina</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Peserta</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : customers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tim</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada tim yang ditugaskan kepada Anda.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {teams.map((t) => (
                <Badge key={t.id} variant="secondary">{t.name}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}