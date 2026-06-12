"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "../../hooks/use-auth"
import { campusesApi } from "../../lib/api/campuses"
import { teamsApi } from "../../lib/api/teams"
import { TeamDto, CampusDto } from "../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog"
import { Input } from "../ui/input"
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

const teamSchema = z.object({
  name: z.string().min(3, "Nama tim minimal 3 karakter"),
  code: z.string().min(2, "Kode tim minimal 2 karakter"),
  grade: z.number().min(1, "Kelas minimal 1").max(12, "Kelas maksimal 12"),
  campusId: z.number().min(1, "Kampus harus dipilih"),
})

type TeamFormValues = z.infer<typeof teamSchema>

interface TeamFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  team: TeamDto | null // If editing, otherwise null for creating
  onSuccess: () => void
}

export function TeamFormModal({ open, onOpenChange, team, onSuccess }: TeamFormModalProps) {
  const { isSuperAdmin, getCampusId } = useAuth()
  const [campuses, setCampuses] = useState<CampusDto[]>([])
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = !!team

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      code: "",
      grade: 1,
      campusId: undefined,
    },
  })

  // Selected campus watchers
  const campusIdValue = watch("campusId")

  // Load campuses if Super Admin
  useEffect(() => {
    if (!open) return

    if (!isSuperAdmin) {
      const myCampusId = getCampusId()
      if (myCampusId) {
        setValue("campusId", myCampusId)
      }
      return
    }

    const fetchCampuses = async () => {
      setIsLoadingCampuses(true)
      try {
        const data = await campusesApi.getCampuses()
        setCampuses(data)
      } catch (error) {
        console.error("Failed to load campuses for form", error)
        toast.error("Gagal memuat daftar kampus")
      } finally {
        setIsLoadingCampuses(false)
      }
    }

    fetchCampuses()
  }, [open, isSuperAdmin, getCampusId, setValue])

  // Populate data when editing
  useEffect(() => {
    if (open && team) {
      reset({
        name: team.name,
        code: team.code,
        grade: team.grade,
        campusId: team.campusId,
      })
    } else if (open && !team) {
      reset({
        name: "",
        code: "",
        grade: 1,
        campusId: !isSuperAdmin ? (getCampusId() || undefined) : undefined,
      })
    }
  }, [open, team, reset, isSuperAdmin, getCampusId])

  const onSubmit = async (values: TeamFormValues) => {
    setIsSubmitting(true)
    const loaderId = toast.loading(isEdit ? "Memperbarui tim..." : "Membuat tim...")
    try {
      if (isEdit && team) {
        await teamsApi.updateTeam(team.id, values)
        toast.success("Tim berhasil diperbarui!", { id: loaderId })
      } else {
        await teamsApi.createTeam(values)
        toast.success("Tim baru berhasil dibuat!", { id: loaderId })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit team form", error)
      toast.error("Gagal menyimpan tim", { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Informasi Tim" : "Tambah Tim Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Nama Tim */}
          <div className="space-y-1">
            <Label htmlFor="name">Nama Tim</Label>
            <Input
              id="name"
              placeholder="e.g. Tim Fatih JKT"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Kode Tim */}
          <div className="space-y-1">
            <Label htmlFor="code">Kode Tim</Label>
            <Input
              id="code"
              placeholder="e.g. TF-JKT"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs font-semibold text-rose-500">{errors.code.message}</p>
            )}
          </div>

          {/* Kelas & Kampus (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kelas / Grade */}
            <div className="space-y-1">
              <Label htmlFor="grade">Kelas (Grade)</Label>
              <Input
                id="grade"
                type="number"
                min="1"
                max="12"
                placeholder="1"
                {...register("grade", { valueAsNumber: true })}
              />
              {errors.grade && (
                <p className="text-xs font-semibold text-rose-500">{errors.grade.message}</p>
              )}
            </div>

            {/* Kampus */}
            <div className="space-y-1">
              <Label htmlFor="campusId">Kampus</Label>
              {!isSuperAdmin ? (
                <Input
                  id="campusIdDisabled"
                  disabled
                  value={team?.campusName || "Kampus Anda"}
                />
              ) : (
                <Select
                  value={campusIdValue ? String(campusIdValue) : ""}
                  onValueChange={(val) => setValue("campusId", Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={isLoadingCampuses ? "Memuat..." : "Pilih Kampus"} />
                  </SelectTrigger>
                  <SelectContent>
                    {campuses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.campusId && (
                <p className="text-xs font-semibold text-rose-500">{errors.campusId.message}</p>
              )}
            </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isEdit ? "Simpan Perubahan" : "Buat Tim"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
