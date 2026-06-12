"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRoleGuard } from "../../../../hooks/use-role-guard"
import { campusesApi } from "../../../../lib/api/campuses"
import { CampusDto } from "../../../../types/api"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { CampusFormModal } from "../../../../components/master/campuses/campus-form-modal"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Card, CardContent } from "../../../../components/ui/card"
import { toast } from "sonner"
import { Plus, Search, Edit2, Trash2 } from "lucide-react"

export default function CampusesPage() {
  // Enforce Super Admin only
  useRoleGuard(true)

  const [campuses, setCampuses] = useState<CampusDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCampus, setSelectedCampus] = useState<CampusDto | null>(null)

  const fetchCampuses = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await campusesApi.getCampuses()
      setCampuses(data)
    } catch (error) {
      console.error("Failed to fetch campuses", error)
      toast.error("Gagal memuat daftar kampus")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCampuses()
  }, [fetchCampuses])

  const handleCreateNew = () => {
    setSelectedCampus(null)
    setIsFormOpen(true)
  }

  const handleEdit = (campus: CampusDto) => {
    setSelectedCampus(campus)
    setIsFormOpen(true)
  }

  const handleDelete = async (campus: CampusDto) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus kampus "${campus.name}"? Tindakan ini akan diblokir jika kampus masih digunakan oleh data lain.`
      )
    ) {
      const loaderId = toast.loading("Sedang menghapus kampus...")
      try {
        await campusesApi.deleteCampus(campus.id)
        toast.success("Kampus berhasil dihapus!", { id: loaderId })
        fetchCampuses()
      } catch (error) {
        console.error("Failed to delete campus", error)
        const err = error as { response?: { data?: { message?: string } } };
        const errorMsg = err.response?.data?.message || "Gagal menghapus kampus"
        toast.error(errorMsg, { id: loaderId })
      }
    }
  }

  // Filter campuses by search query
  const filteredCampuses = campuses.filter((c) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true
    return c.name.toLowerCase().includes(query) || String(c.id).includes(query)
  })

  const columns: ColumnDef<CampusDto>[] = [
    {
      header: "ID",
      accessorKey: "id",
      className: "w-20 font-mono text-xs",
    },
    {
      header: "Nama Kampus",
      accessorKey: "name",
      className: "font-semibold text-foreground",
    },
    {
      header: "Aksi",
      className: "w-32 text-right",
      render: (row) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
            className="h-8 w-8 text-muted-foreground hover:text-accent-foreground"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row)}
            className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Manajemen Kampus
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola daftar cabang atau lokasi kampus penyelenggaraan mentoring.
          </p>
        </div>

        <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="mr-2 h-4 w-4" /> Tambah Kampus
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border/60 shadow-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan nama kampus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Campus Table List */}
      <DataTable
        columns={columns}
        data={filteredCampuses}
        isLoading={isLoading}
        emptyMessage="Tidak ada data kampus yang ditemukan."
      />

      {/* Campus Create/Edit Form Modal */}
      <CampusFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        campus={selectedCampus}
        onSuccess={fetchCampuses}
      />
    </div>
  )
}
