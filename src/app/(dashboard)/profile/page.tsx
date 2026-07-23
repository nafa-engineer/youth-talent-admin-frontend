"use client"

import React, { useEffect, useState } from "react"
import { authApi } from "../../../lib/api/auth"
import { AdminDto } from "../../../types/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Skeleton } from "../../../components/ui/skeleton"
import { RoleBadge } from "../../../components/layout/role-badge"
import { toast } from "sonner"
import { User, Mail, MapPin, Calendar, Shield, Info, CheckCircle2, XCircle } from "lucide-react"
import { formatDate } from "../../../lib/utils"

export default function ProfilePage() {
  const [profile, setProfile] = useState<AdminDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const data = await authApi.getProfile()
        setProfile(data)
      } catch (error) {
        console.error("Failed to fetch profile", error)
        toast.error("Gagal memuat profil admin")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <Card className="border-border/60 shadow-md">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <Info className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Profil tidak ditemukan</h2>
        <p className="text-muted-foreground">Terjadi kesalahan saat mengambil data profil Anda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Profil Saya
        </h1>
        <p className="text-muted-foreground mt-1">
          Informasi lengkap mengenai akun pengelola Anda di platform Indonesia Youth Talent.
        </p>
      </div>

      {/* Profile Card */}
      <Card className="border-border/60 shadow-md overflow-hidden bg-card/60 backdrop-blur-sm">
        {/* Banner Aksen Hijau/Emas */}
        <div className="h-24 bg-gradient-to-r from-primary to-secondary/80 relative" />

        <CardHeader className="relative pt-10 px-6 sm:px-8 border-b border-border/40">
          {/* Avatar Bulat besar */}
          <div className="absolute -top-12 left-6 sm:left-8 w-20 h-20 rounded-full border-4 border-card bg-primary text-primary-foreground flex items-center justify-center shadow-lg font-bold text-2xl select-none">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-2">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                {profile.name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Terdaftar sebagai pengelola aplikasi
              </CardDescription>
            </div>
            <div>
              <RoleBadge role={profile.adminGroupCode} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Nama Lengkap
                </span>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {profile.name}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alamat Email
                </span>
                <p className="text-base font-semibold text-foreground mt-0.5 break-all">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Wilayah Kampus */}
            <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wilayah Kampus
                </span>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {profile.adminGroupCode === "SUPER_ADMIN" 
                    ? "Semua Kampus (Super Admin)" 
                    : profile.campusName || "Tidak ditugaskan"
                  }
                </p>
              </div>
            </div>

            {/* Status Akun */}
            <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status Akun
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  {profile.isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-base font-semibold text-emerald-600">Aktif</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-500" />
                      <span className="text-base font-semibold text-rose-600">Nonaktif</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tanggal Bergabung */}
            <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
              <div className="p-2 rounded-md bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bergabung Sejak
                </span>
                <p className="text-base font-semibold text-foreground mt-0.5">
                  {formatDate(profile.createdAt)}
                </p>
              </div>
            </div>

            {/* Masa Berlaku Akun */}
            {profile.expiredAt && (
              <div className="flex gap-4 items-start p-4 rounded-lg bg-muted/30 border border-border/20 transition-all hover:bg-muted/50">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Masa Berlaku Akun
                  </span>
                  <p className="text-base font-semibold text-foreground mt-0.5">
                    s.d. {formatDate(profile.expiredAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
