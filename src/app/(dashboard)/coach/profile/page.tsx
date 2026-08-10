"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useCoachRoleGuard } from "../../../../hooks/use-role-guard"
import { coachDataApi } from "../../../../lib/api/coach-data"
import { CoachDto } from "../../../../types/api"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { Badge } from "../../../../components/ui/badge"
import { toast } from "sonner"

export default function CoachProfilePage() {
  const { isAuthorized } = useCoachRoleGuard()
  const [profile, setProfile] = useState<CoachDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await coachDataApi.getProfile()
      setProfile(data)
    } catch (error) {
      console.error("Failed to fetch coach profile", error)
      toast.error("Gagal memuat profil")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
  }, [isAuthorized, fetchProfile])

  if (!isAuthorized) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Profil Saya</h1>
        <p className="text-muted-foreground mt-1">Informasi akun coach Anda.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading || !profile ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : (
            <>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Nama</span>
                <span className="font-medium">{profile.name}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{profile.email}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Jenis Kelamin</span>
                <span className="font-medium">{profile.gender === "PRIA" ? "Ikhwan" : "Akhwat"}</span>
              </div>
              <div className="flex justify-between text-sm border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={profile.isInternal ? "default" : "outline"}>
                  {profile.isInternal ? "Internal" : "Eksternal"}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground text-sm block mb-2">Tim Dibina</span>
                <div className="flex flex-wrap gap-2">
                  {profile.teams.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Belum ada tim</span>
                  ) : (
                    profile.teams.map((t) => (
                      <Badge key={t.id} variant="secondary">{t.name}</Badge>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}