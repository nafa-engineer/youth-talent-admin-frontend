"use client"

import React, { useEffect, useState } from "react"
import { teamsApi } from "../../lib/api/teams"
import { customersApi } from "../../lib/api/customers"
import { TeamDto, CustomerDto } from "../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { toast } from "sonner"
import { ArrowLeftRight } from "lucide-react"

interface TransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCustomers: CustomerDto[]
  onSuccess: () => void
}

export function TransferModal({ open, onOpenChange, selectedCustomers, onSuccess }: TransferModalProps) {
  const [teams, setTeams] = useState<TeamDto[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all teams cross-campus
  useEffect(() => {
    if (!open) return

    const fetchAllTeams = async () => {
      setIsLoadingTeams(true)
      try {
        // Fetch all teams without campusId filter to allow cross-campus selection
        const data = await teamsApi.getTeams()
        setTeams(data)
      } catch (error) {
        console.error("Failed to fetch teams for transfer", error)
        toast.error("Gagal memuat daftar tim")
      } finally {
        setIsLoadingTeams(false)
      }
    }

    fetchAllTeams()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedTeamId("") // Reset select
  }, [open])

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId) {
      toast.error("Pilih tim tujuan terlebih dahulu")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading(`Sedang memindahkan ${selectedCustomers.length} peserta...`)

    try {
      const targetTeamId = Number(selectedTeamId)
      // Execute transfers in parallel
      await Promise.all(
        selectedCustomers.map((customer) =>
          customersApi.transferTeam({
            customerId: customer.id,
            teamId: targetTeamId,
          })
        )
      )

      toast.success(`Berhasil memindahkan ${selectedCustomers.length} peserta!`, { id: toastId })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to transfer participants", error)
      toast.error("Gagal memindahkan peserta. Silakan coba lagi.", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
            Transfer Peserta Lintas Kampus
          </DialogTitle>
          <DialogDescription>
            Pindahkan peserta terpilih ke tim halaqah lain. Kampus peserta akan otomatis disesuaikan dengan kampus tim tujuan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="space-y-4 pt-2">
          {/* List of selected participants */}
          <div className="space-y-1.5">
            <Label>Peserta Terpilih ({selectedCustomers.length})</Label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-border bg-muted/30 p-2.5 text-xs space-y-1">
              {selectedCustomers.map((c) => (
                <div key={c.id} className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <span className="text-muted-foreground bg-muted px-1.5 py-0.2 rounded text-[10px]">
                    {c.teamName || "Tanpa Tim"} • {c.campusName || "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Team Select */}
          <div className="space-y-1.5">
            <Label htmlFor="targetTeam">Tim / Halaqah Tujuan</Label>
            <Select value={selectedTeamId} onValueChange={(val) => setSelectedTeamId(val || "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingTeams ? "Memuat tim..." : "Pilih Tim Tujuan"} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name} ({t.campusName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedTeamId}>
              Konfirmasi Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
