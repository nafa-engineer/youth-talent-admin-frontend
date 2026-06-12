"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRoleGuard } from "../../../../hooks/use-role-guard"
import { useAuth } from "../../../../hooks/use-auth"
import { adminsApi } from "../../../../lib/api/admins"
import { AdminDto } from "../../../../types/api"
import { UserRole } from "../../../../types/auth"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { RoleBadge } from "../../../../components/layout/role-badge"
import { AdminFormModal } from "../../../../components/master/admins/admin-form-modal"
import { TransferCampusModal } from "../../../../components/master/admins/transfer-campus-modal"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent } from "../../../../components/ui/card"
import { formatDate } from "../../../../lib/utils"
import { toast } from "sonner"
import { Plus, Search, Edit2, ShieldAlert, ArrowLeftRight } from "lucide-react"

export default function AdminsPage() {
  // Enforce Super Admin only
  useRoleGuard(true)
  const { user } = useAuth()

  const [admins, setAdmins] = useState<AdminDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAdminForEdit, setSelectedAdminForEdit] = useState<AdminDto | null>(null)

  // Transfer Modal States
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedAdminForTransfer, setSelectedAdminForTransfer] = useState<AdminDto | null>(null)

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await adminsApi.getAdmins()
      setAdmins(data)
    } catch (error) {
      console.error("Failed to fetch admins", error)
      toast.error("Gagal memuat daftar admin")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmins()
  }, [fetchAdmins])

  const handleCreateNew = () => {
    setSelectedAdminForEdit(null)
    setIsFormOpen(true)
  }

  const handleEdit = (admin: AdminDto) => {
    setSelectedAdminForEdit(admin)
    setIsFormOpen(true)
  }

  const handleTransfer = (admin: AdminDto) => {
    setSelectedAdminForTransfer(admin)
    setIsTransferOpen(true)
  }

  const handleDeactivate = async (admin: AdminDto) => {
    if (admin.email === user?.email) {
      toast.error("Anda tidak dapat menonaktifkan akun Anda sendiri!")
      return
    }

    if (
      window.confirm(
        `Apakah Anda yakin ingin menonaktifkan admin "${admin.name}"? Admin yang dinonaktifkan tidak akan bisa login lagi.`
      )
    ) {
      const loaderId = toast.loading("Sedang menonaktifkan admin...")
      try {
        await adminsApi.deactivateAdmin(admin.id)
        toast.success("Admin berhasil dinonaktifkan!", { id: loaderId })
        fetchAdmins()
      } catch (error) {
        console.error("Failed to deactivate admin", error)
        const err = error as { response?: { data?: { message?: string } } };
        const errorMsg = err.response?.data?.message || "Gagal menonaktifkan admin"
        toast.error(errorMsg, { id: loaderId })
      }
    }
  }

  // Filter admins by search query
  const filteredAdmins = admins.filter((a) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return (
      a.name.toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      (a.campusName && a.campusName.toLowerCase().includes(query))
    )
  })

  const columns: ColumnDef<AdminDto>[] = [
    {
      header: "Admin",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    {
      header: "Peran",
      render: (row) => <RoleBadge role={row.adminGroupCode} />,
    },
    {
      header: "Kampus Penugasan",
      render: (row) => (
        <span className="text-sm">
          {row.adminGroupCode === UserRole.SUPER_ADMIN ? "Semua Kampus (Super)" : row.campusName || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => (
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.isActive
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-700 border border-rose-500/20"
          }`}
        >
          {row.isActive ? "Aktif" : "Nonaktif"}
        </div>
      ),
    },
    {
      header: "Tanggal Dibuat",
      render: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      header: "Aksi",
      className: "w-44 text-right",
      render: (row) => {
        const isSelf = row.email === user?.email
        const isSuper = row.adminGroupCode === UserRole.SUPER_ADMIN

        return (
          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {/* Edit */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(row)}
              className="h-8 w-8 text-muted-foreground hover:text-accent-foreground"
              title="Edit Akun"
            >
              <Edit2 className="h-4 w-4" />
            </Button>

            {/* Transfer Kampus (Hanya untuk Admin biasa, bukan Super Admin) */}
            {!isSuper && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTransfer(row)}
                className="h-8 w-8 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50"
                title="Transfer Kampus"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            )}

            {/* Deactivate (Hanya jika masih aktif & bukan diri sendiri) */}
            {row.isActive && !isSelf && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeactivate(row)}
                className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                title="Nonaktifkan Admin"
              >
                <ShieldAlert className="h-4 w-4" />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Manajemen Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola akun pengelola mentoring (Admin Kampus) dan wilayah tugas mereka.
          </p>
        </div>

        <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" /> Tambah Admin
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau kampus admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins Table List */}
      <DataTable
        columns={columns}
        data={filteredAdmins}
        isLoading={isLoading}
        emptyMessage="Tidak ada data admin yang ditemukan."
      />

      {/* Admin Create/Edit Form Modal */}
      <AdminFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        admin={selectedAdminForEdit}
        onSuccess={fetchAdmins}
      />

      {/* Transfer Campus Modal */}
      <TransferCampusModal
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        admin={selectedAdminForTransfer}
        onSuccess={fetchAdmins}
      />
    </div>
  )
}
