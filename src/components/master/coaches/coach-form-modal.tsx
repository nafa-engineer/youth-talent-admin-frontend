"use client"

import React, { useEffect, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { coachesApi } from "../../../lib/api/coaches"
import { CoachDto } from "../../../types/api"
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
import { GENDER_OPTIONS } from "../../../lib/constants"
import { toast } from "sonner"

interface CoachFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const coachSchema = z.object({
  name: z.string().min(3, "Nama coach minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phoneNumber: z.string().min(8, "Nomor HP minimal 8 karakter"),
  gender: z.enum(["PRIA", "WANITA"], { message: "Jenis kelamin harus dipilih" }),
  isInternal: z.enum(["true", "false"], { message: "Status internal harus dipilih" }),
})

type CoachFormValues = z.infer<typeof coachSchema>

export function CoachFormModal({ open, onOpenChange, onSuccess }: CoachFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingCoaches, setExistingCoaches] = useState<CoachDto[]>([])
  const [showExisting, setShowExisting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      gender: undefined,
      isInternal: undefined,
    },
  })

  const genderValue = useWatch({ control, name: "gender" })
  const isInternalValue = useWatch({ control, name: "isInternal" })
  const emailValue = useWatch({ control, name: "email" })
  const phoneValue = useWatch({ control, name: "phoneNumber" })

  useEffect(() => {
    if (open) {
      reset({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        gender: undefined,
        isInternal: undefined,
      })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingCoaches([])
      setShowExisting(false)
    }
  }, [open, reset])

  const query = `${emailValue || ""}|${phoneValue || ""}`.trim()

  useEffect(() => {
    if (!query || !open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExistingCoaches([])
      setShowExisting(false)
      return
    }
    const t = setTimeout(async () => {
      try {
        const coaches = await coachesApi.getCoaches()
        const matches = coaches.filter((c) => {
          const em = (c.email || "").toLowerCase()
          const ph = (c.phoneNumber || "").toLowerCase()
          const q = query.toLowerCase()
          return em.includes(q) || ph.includes(q)
        })
        setExistingCoaches(matches)
        setShowExisting(matches.length > 0)
      } catch {
        setExistingCoaches([])
        setShowExisting(false)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [query, open])

  const onSubmit = async (values: CoachFormValues) => {
    setIsSubmitting(true)
    const loaderId = toast.loading("Membuat coach...")
    try {
      await coachesApi.createCoach({
        name: values.name,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        isInternal: values.isInternal === "true",
      })
      toast.success("Coach baru berhasil dibuat!", { id: loaderId })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to submit coach form", error)
      const err = error as { response?: { data?: { message?: string } } }
      const errorMsg = err.response?.data?.message || "Gagal menyimpan coach"
      toast.error(errorMsg, { id: loaderId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Tambah Coach Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" placeholder="e.g. Fulan Abdullah" {...register("name")} />
            {errors.name && <p className="text-xs font-semibold text-rose-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Alamat Email</Label>
            <Input id="email" type="email" placeholder="e.g. fulan@gmail.com" {...register("email")} />
            {errors.email && <p className="text-xs font-semibold text-rose-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Nomor HP</Label>
            <Input id="phoneNumber" type="tel" placeholder="e.g. 081234567890" {...register("phoneNumber")} />
            {errors.phoneNumber && <p className="text-xs font-semibold text-rose-500">{errors.phoneNumber.message}</p>}
          </div>

          {showExisting && (
            <div className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-700">
                Coach sudah terdaftar dengan email/HP ini:
              </p>
              <ul className="space-y-1">
                {existingCoaches.map((c) => (
                  <li key={c.id} className="text-xs text-amber-800">
                    {c.name} ({c.email})
                    {c.teams.length > 0 ? ` — sudah membina ${c.teams.length} tim` : " — belum punya tim"}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-600">
                Pilih coach lama lalu gunakan menu &quot;Kelola Tim&quot; untuk menambah assign, tanpa membuat duplikat.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs font-semibold text-rose-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="gender">Jenis Kelamin</Label>
            <Select
              value={genderValue || ""}
              onValueChange={(val) => setValue("gender", val as "PRIA" | "WANITA", { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs font-semibold text-rose-500">{errors.gender.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="isInternal">Status Coach</Label>
            <Select
              value={isInternalValue || ""}
              onValueChange={(val) => setValue("isInternal", val as "true" | "false", { shouldValidate: true })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Internal</SelectItem>
                <SelectItem value="false">Eksternal</SelectItem>
              </SelectContent>
            </Select>
            {errors.isInternal && <p className="text-xs font-semibold text-rose-500">{errors.isInternal.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Buat Coach
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}