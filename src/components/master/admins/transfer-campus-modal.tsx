"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminsApi } from "../../../lib/api/admins"
import { campusesApi } from "../../../lib/api/campuses"
import { CampusDto, AdminDto } from "../../../types/api"
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
import { toast } from "sonner"

const transferSchema = z.object({
  campusId: z.number().min(1, "Kampus tujuan harus dipilih"),
})

type TransferFormValues = z.infer<typeof transferSchema>

interface TransferCampusModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  admin: AdminDto | null
  onSuccess: () => void
}

export function TransferCampusModal({ open, onOpenChange, admin, onSuccess }: TransferCampusModalProps) {
  const [campuses, setCampuses] = useState<CampusDto[]>([])
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      campusId: undefined,
    },
  })

  const campusIdValue = watch("campusId")

  // Load campuses
  useEffect(() => {
    if (!open) return

    const fetchCampuses = async () => {
      setIsLoadingCampuses(true)
      try {
        const data = await campusesApi.getCampuses()
        // Filter out the current campus of the admin if any
        setCampuses(data)
      } catch (error) {
        console.error("Failed to load campuses", error)
        toast.error("Gagal memuat daftar kampus")
      } finally {
        setIsLoadingCampuses(false)
      }
    }

    fetchCampuses()
  }, [open, admin])

  // Reset selected campus when modal opens
  useEffect(() => {
    if (open) {
      reset({
        campusId: admin?.campusId || undefined,
      })
    }
  }, [open, admin, reset])

  const onSubmit = async (values: TransferFormValues) => {
    if (!admin) return
    setIsSubmitting(true)
    const loaderId = toast.loading(`Sedang memindahkan penugasan ${admin.name}...`)
    try {
      await adminsApi.transferCampus(admin.id, { campusId: values.campusId })
      toast.success("Penugasan admin berhasil dipindahkan!", { id: loaderId })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to transfer admin campus", error)
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || "Gagal memindahkan penugasan admin"
      toast.error(errorMsg, { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Transfer Penugasan Kampus</DialogTitle>
          <DialogDescription>
            Pindahkan wilayah tugas admin <span className="font-semibold text-foreground">{admin?.name}</span> ke kampus lain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Info Kampus Lama */}
          <div className="text-sm bg-muted/40 border p-3 rounded-lg space-y-1">
            <span className="text-muted-foreground block text-xs">Kampus Penugasan Saat Ini:</span>
            <span className="font-semibold">{admin?.campusName || "Tidak Ada Kampus / Super Admin"}</span>
          </div>

          {/* Kampus Tujuan */}
          <div className="space-y-1">
            <Label htmlFor="campusId">Pilih Kampus Tujuan</Label>
            <Select
              value={campusIdValue ? String(campusIdValue) : ""}
              onValueChange={(val) => setValue("campusId", Number(val), { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={isLoadingCampuses ? "Memuat..." : "Pilih Kampus Baru"} />
              </SelectTrigger>
              <SelectContent>
                {campuses
                  .filter((c) => c.id !== admin?.campusId) // Filter out the current campus
                  .map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.campusId && (
              <p className="text-xs font-semibold text-rose-500">{errors.campusId.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || campusIdValue === admin?.campusId}>
              Pindahkan Tugas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
