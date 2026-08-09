"use client"

import React, { useEffect, useState } from "react"
import { coachesApi } from "../../../lib/api/coaches"
import { teamsApi } from "../../../lib/api/teams"
import { CoachDto, TeamDto } from "../../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import { Badge } from "../../ui/badge"
import { X } from "lucide-react"
import { toast } from "sonner"

interface AssignTeamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coach: CoachDto | null
  onSuccess: () => void
}

export function AssignTeamModal({ open, onOpenChange, coach, onSuccess }: AssignTeamModalProps) {
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const fetchTeams = async () => {
      setIsLoadingTeams(true)
      try {
        const data = await teamsApi.getTeams()
        setTeams(data)
      } catch (error) {
        console.error("Failed to load teams", error)
        toast.error("Gagal memuat daftar tim")
      } finally {
        setIsLoadingTeams(false)
      }
    }
    fetchTeams()
  }, [open])

  useEffect(() => {
    if (open) setSelectedTeamId("")
  }, [open, coach])

  const assignedTeamIds = new Set((coach?.teams || []).map((t) => t.id))
  const availableTeams = teams.filter((t) => !assignedTeamIds.has(t.id))

  const handleAssign = async () => {
    if (!coach || !selectedTeamId) return
    setIsSubmitting(true)
    const loaderId = toast.loading("Menambahkan tim...")
    try {
      await coachesApi.assignTeam(coach.id, { teamId: Number(selectedTeamId) })
      toast.success("Tim berhasil ditambahkan!", { id: loaderId })
      setSelectedTeamId("")
      onSuccess()
    } catch (error) {
      console.error("Failed to assign team", error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal menambahkan tim", { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnassign = async (teamId: number, teamName: string) => {
    if (!coach) return
    if (!window.confirm(`Hapus tim "${teamName}" dari coach "${coach.name}"?`)) return
    const loaderId = toast.loading("Menghapus tim...")
    try {
      await coachesApi.unassignTeam(coach.id, teamId)
      toast.success("Tim berhasil dihapus dari coach!", { id: loaderId })
      onSuccess()
    } catch (error) {
      console.error("Failed to unassign team", error)
      const err = error as { response?: { data?: { message?: string } } }
      toast.error(err.response?.data?.message || "Gagal menghapus tim", { id: loaderId })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Kelola Tim Coach</DialogTitle>
          <DialogDescription>
            Atur tim yang dibina oleh <span className="font-semibold text-foreground">{coach?.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Tim yang sudah ter-assign */}
          <div className="space-y-1">
            <Label>Tim Saat Ini</Label>
            <div className="flex flex-wrap gap-2 min-h-9 border rounded-lg p-2 bg-muted/20">
              {(coach?.teams || []).length === 0 && (
                <span className="text-xs text-muted-foreground px-1 py-1">Belum ada tim ditugaskan.</span>
              )}
              {(coach?.teams || []).map((t) => (
                <Badge key={t.id} variant="secondary" className="flex items-center gap-1 pr-1">
                  {t.name}
                  <button
                    type="button"
                    onClick={() => handleUnassign(t.id, t.name)}
                    className="ml-1 rounded-full hover:bg-rose-500/20 p-0.5"
                    title="Hapus tim"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tambah tim baru */}
          <div className="space-y-1">
            <Label htmlFor="teamId">Tambah Tim</Label>
            <div className="flex gap-2">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isLoadingTeams ? "Memuat..." : "Pilih Tim"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTeams.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAssign} disabled={!selectedTeamId || isSubmitting}>
                Tambah
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}