"use client"

import React from "react"
import { useCoachRoleGuard } from "../../../hooks/use-role-guard"
import { useAuth } from "../../../hooks/use-auth"

export default function CoachDashboardPage() {
  const { isAuthorized } = useCoachRoleGuard()
  const { getName } = useAuth()

  if (!isAuthorized) {
    return null // atau skeleton loading, dibahas nanti
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Selamat datang, {getName()}
        </h1>
        <p className="text-muted-foreground mt-1">
          Dashboard coach — ringkasan tim yang Anda bina.
        </p>
      </div>
      {/* Konten dashboard menyusul: tim, rekap mentoring, skor amalan */}
    </div>
  )
}