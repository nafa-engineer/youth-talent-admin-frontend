"use client"

import React, { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { adminsApi } from "../../../lib/api/admins"
import { campusesApi } from "../../../lib/api/campuses"
import { CampusDto, AdminRequestDto } from "../../../types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog"
import { Input } from "../../ui/input"
import { PasswordInput } from "../../ui/password-input"
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
import { ShieldAlert } from "lucide-react"

interface AdminFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ADMIN_GROUP_ID = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
} as const

export function AdminFormModal({ open, onOpenChange, onSuccess }: AdminFormModalProps) {
  const [campuses, setCampuses] = useState<CampusDto[]>([])
  const [isLoadingCampuses, setIsLoadingCampuses] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const adminSchema = z
    .object({
      role: z.enum(["ADMIN", "SUPER_ADMIN"]),
      name: z.string().min(3, "Nama admin minimal 3 karakter"),
      email: z.string().email("Format email tidak valid"),
      password: z.string().min(6, "Password minimal 6 karakter"),
      campusId: z.number().optional(),
      currentPassword: z.string().optional(),
      confirmSuper: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === "ADMIN" && (!data.campusId || data.campusId < 1)) {
        ctx.addIssue({
          code: "custom",
          path: ["campusId"],
          message: "Kampus penugasan harus dipilih",
        })
      }
      if (data.role === "SUPER_ADMIN") {
        if (!data.currentPassword || data.currentPassword.trim() === "") {
          ctx.addIssue({
            code: "custom",
            path: ["currentPassword"],
            message: "Password Anda wajib diisi",
          })
        }
        if (!data.confirmSuper) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmSuper"],
            message: "Anda harus menyetujui pernyataan ini",
          })
        }
      }
    })

  type AdminFormValues = z.infer<typeof adminSchema>

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      role: "ADMIN",
      name: "",
      email: "",
      password: "",
      campusId: undefined,
      currentPassword: "",
      confirmSuper: false,
    },
  })

  const role = useWatch({ control, name: "role" })
  const campusIdValue = useWatch({ control, name: "campusId" })
  const isSuperAdmin = role === "SUPER_ADMIN"

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
        role: "ADMIN",
        name: "",
        email: "",
        password: "",
        campusId: undefined,
        currentPassword: "",
        confirmSuper: false,
      })
    }
  }, [open, reset])

  const onSubmit = async (values: AdminFormValues) => {
    setIsSubmitting(true)
    const loaderId = toast.loading("Membuat admin...")
    try {
      const superAdmin = values.role === "SUPER_ADMIN"
      const payload: AdminRequestDto = {
        name: values.name,
        email: values.email,
        password: values.password,
        adminGroupId: superAdmin ? ADMIN_GROUP_ID.SUPER_ADMIN : ADMIN_GROUP_ID.ADMIN,
        campusId: superAdmin ? null : values.campusId ?? null,
        ...(superAdmin ? { currentPassword: values.currentPassword } : {}),
      }

      await adminsApi.createAdmin(payload)
      toast.success(
        superAdmin ? "Super Admin baru berhasil dibuat!" : "Admin baru berhasil dibuat!",
        { id: loaderId }
      )
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
          {/* Peran */}
          <div className="space-y-1">
            <Label htmlFor="role">Peran</Label>
            <Select
              value={role}
              onValueChange={(val) => setValue("role", (val || "ADMIN") as AdminFormValues["role"], { shouldValidate: true })}
              items={{ ADMIN: "Admin Kampus", SUPER_ADMIN: "Super Admin" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin Kampus</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {/* Password akun baru */}
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-semibold text-rose-500">{errors.password.message}</p>
            )}
          </div>

          {/* Kampus Penugasan (hanya Admin Kampus) */}
          {!isSuperAdmin && (
            <div className="space-y-1">
              <Label htmlFor="campusId">Kampus Penugasan</Label>
              <Select
                value={campusIdValue ? String(campusIdValue) : ""}
                onValueChange={(val) => setValue("campusId", Number(val), { shouldValidate: true })}
                items={Object.fromEntries(campuses.map((c) => [String(c.id), c.name]))}
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
          )}

          {/* Step-up + konfirmasi (hanya Super Admin) */}
          {isSuperAdmin && (
            <>
              <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Super Admin memiliki akses penuh ke seluruh data. Masukkan password akun Anda untuk
                  melanjutkan.
                </span>
              </div>

              <div className="space-y-1">
                <Label htmlFor="currentPassword">Password Anda</Label>
                <PasswordInput
                  id="currentPassword"
                  placeholder="Password akun yang sedang login"
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-xs font-semibold text-rose-500">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                    {...register("confirmSuper")}
                  />
                  <span>
                    Saya memahami akun ini akan memiliki akses penuh dan menyetujui pembuatannya.
                  </span>
                </label>
                {errors.confirmSuper && (
                  <p className="text-xs font-semibold text-rose-500">{errors.confirmSuper.message}</p>
                )}
              </div>
            </>
          )}

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
              {isSuperAdmin ? "Buat Super Admin" : "Buat Admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}