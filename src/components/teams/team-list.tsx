"use client"

import React from "react"
import Link from "next/link"
import { TeamDto } from "../../types/api"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Skeleton } from "../ui/skeleton"
import { Users, GraduationCap, Edit, Trash2, Eye, MapPin } from "lucide-react"

interface TeamListProps {
  teams: TeamDto[]
  isLoading: boolean
  onEdit: (team: TeamDto) => void
  onDelete: (team: TeamDto) => void
}

export function TeamList({ teams, isLoading, onEdit, onDelete }: TeamListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card">
        <Users className="mx-auto h-12 w-12 text-muted-foreground/60" />
        <h3 className="mt-4 text-lg font-bold text-foreground">Tidak Ada Tim</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Belum ada tim yang terdaftar untuk kampus terpilih atau kriteria pencarian Anda.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <Card 
          key={team.id} 
          className="group relative border-border/50 bg-card hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-0.5 border-t-4 border-t-primary/80"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {team.name}
                </CardTitle>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                  Code: {team.code}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-1">
            <div className="space-y-2 text-sm text-muted-foreground">
              {/* Kelas */}
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>Kelas {team.grade}</span>
              </div>
              
              {/* Kampus */}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="line-clamp-1">{team.campusName}</span>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
              <Link href={`/teams/${team.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Detail
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(team)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete(team)}
                className="hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 text-muted-foreground hover:border-rose-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
