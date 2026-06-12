"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { campusesApi } from "../../../lib/api/campuses"
import { CampusDto } from "../../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog"
import { Input } from "../../ui/input"
import { Label } from "../../ui/label"
import { Button } from "../../ui/button"
import { toast } from "sonner"

const campusSchema = z.object({
  name: z.string().min(3, "Nama kampus minimal 3 karakter"),
})

type CampusFormValues = z.infer<typeof campusSchema>

interface CampusFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campus: CampusDto | null // If editing, otherwise null for creating
  onSuccess: () => void
}

export function CampusFormModal({ open, onOpenChange, campus, onSuccess }: CampusFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!campus

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CampusFormValues>({
    resolver: zodResolver(campusSchema),
    defaultValues: {
      name: "",
    },
  })

  // Populate data when editing
  useEffect(() => {
    if (open && campus) {
      reset({
        name: campus.name,
      })
    } else if (open && !campus) {
      reset({
        name: "",
      })
    }
  }, [open, campus, reset])

  const onSubmit = async (values: CampusFormValues) => {
    setIsSubmitting(true)
    const loaderId = toast.loading(isEdit ? "Memperbarui kampus..." : "Membuat kampus...")
    try {
      if (isEdit && campus) {
        await campusesApi.updateCampus(campus.id, values)
        toast.success("Kampus berhasil diperbarui!", { id: loaderId })
      } else {
        await campusesApi.createCampus(values)
        toast.success("Kampus baru berhasil dibuat!", { id: loaderId })
      }
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit campus form", error)
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || "Gagal menyimpan kampus"
      toast.error(errorMsg, { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Informasi Kampus" : "Tambah Kampus Baru"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Nama Kampus */}
          <div className="space-y-1">
            <Label htmlFor="name">Nama Kampus</Label>
            <Input
              id="name"
              placeholder="e.g. Kampus Depok"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>
            )}
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
              {isEdit ? "Simpan Perubahan" : "Buat Kampus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
