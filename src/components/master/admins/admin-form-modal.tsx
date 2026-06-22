"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminsApi } from "../../../lib/api/admins"
import { campusesApi } from "../../../lib/api/campuses"
import { CampusDto, AdminDto } from "../../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog"
import { Input } from "../../ui/input"
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

interface AdminFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AdminFormModal({ open, onOpenChange, onSuccess }: AdminFormModalProps) {
  const [campuses, setCampuses] = useState<CampusDto[]>([])
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const adminSchema = z.object({
    name: z.string().min(3, "Nama admin minimal 3 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    campusId: z.number().min(1, "Kampus penugasan harus dipilih"),
  })

  type AdminFormValues = z.infer<typeof adminSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
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
        setCampuses(data)
      } catch (error) {
        console.error("Failed to load campuses", error)
        toast.error("Gagal memuat daftar kampus")
      } finally {
        setIsLoadingCampuses(false)
      }
    }

    fetchCampuses()
  }, [open])

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        name: "",
        email: "",
        password: "",
        campusId: undefined,
      })
    }
  }, [open, reset])

  const onSubmit = async (values: AdminFormValues) => {
    setIsSubmitting(true)
    const loaderId = toast.loading("Membuat admin...")
    try {
      // Mapping adminGroupId to 2 (regular ADMIN) based on user rule
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        adminGroupId: 2, // 2 = ADMIN
        campusId: values.campusId,
      }

      await adminsApi.createAdmin(payload)
      toast.success("Admin baru berhasil dibuat!", { id: loaderId })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit admin form", error)
      const err = error as { response?: { data?: { message?: string } } };
      const errorMsg = err.response?.data?.message || "Gagal menyimpan admin"
      toast.error(errorMsg, { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Tambah Admin Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Nama Lengkap */}
          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="e.g. Irfan Hakim"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Alamat Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="e.g. irfan@gmail.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Kampus Penugasan */}
          <div className="space-y-1">
            <Label htmlFor="campusId">Kampus Penugasan</Label>
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
            {errors.campusId && (
              <p className="text-xs font-semibold text-rose-500">{errors.campusId.message}</p>
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
              Buat Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
