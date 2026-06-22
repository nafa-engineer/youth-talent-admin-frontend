"use client"

import React, { use, useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../../../../hooks/use-auth"
import { teamsApi } from "../../../../lib/api/teams"
import { customersApi } from "../../../../lib/api/customers"
import { TeamDto, CustomerDto } from "../../../../types/api"
import { DataTable, ColumnDef } from "../../../../components/shared/data-table"
import { TeamFormModal } from "../../../../components/teams/team-form-modal"
import { TransferModal } from "../../../../components/teams/transfer-modal"
import { Button } from "../../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card"
import { ForbiddenPage } from "../../../../components/shared/forbidden-page"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Users, 
  GraduationCap, 
  MapPin, 
  Edit, 
  Trash2, 
  ArrowLeftRight, 
  CheckSquare, 
  Square,
  Mail,
  UserCheck
} from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TeamDetailPage({ params }: PageProps) {
  const router = useRouter()
  const { isSuperAdmin, getCampusId } = useAuth()
  const resolvedParams = use(params)
  const teamId = Number(resolvedParams.id)

  // Data States
  const [team, setTeam] = useState<TeamDto | null>(null)
  const [members, setMembers] = useState<CustomerDto[]>([])
  
  // Loading States
  const [isLoadingTeam, setIsLoadingTeam] = useState(true)
  const [isLoadingMembers, setIsLoadingMembers] = useState(true)
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [selectedMembersForTransfer, setSelectedMembersForTransfer] = useState<CustomerDto[]>([])

  // Selection state for bulk actions
  const [selectedMembers, setSelectedMembers] = useState<CustomerDto[]>([])

  const fetchTeamData = useCallback(async () => {
    setIsLoadingTeam(true)
    try {
      const data = await teamsApi.getTeamById(teamId)
      setTeam(data)
    } catch (error) {
      console.error("Failed to fetch team details", error)
      toast.error("Gagal memuat informasi tim")
    } finally {
      setIsLoadingTeam(false)
    }
  }, [teamId])

  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true)
    try {
      const response = await customersApi.getCustomers({ teamId })
      // Since it returns PageCustomerDto: { content: [...] }
      setMembers(response.content || [])
    } catch (error) {
      console.error("Failed to fetch team members", error)
      toast.error("Gagal memuat daftar anggota tim")
    } finally {
      setIsLoadingMembers(false)
    }
  }, [teamId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTeamData()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMembers()
  }, [fetchTeamData, fetchMembers])

  // RBAC Access Control Check
  const hasAccess = isSuperAdmin || (team && getCampusId() === team.campusId)

  const handleEditSuccess = () => {
    fetchTeamData()
    fetchMembers()
  }

  const handleDeleteTeam = async () => {
    toast.info("Fitur ini belum tersedia")
  }

  const handleTransferSingle = (member: CustomerDto) => {
    setSelectedMembersForTransfer([member])
    setIsTransferModalOpen(true)
  }

  const handleTransferBulk = () => {
    if (selectedMembers.length === 0) return
    setSelectedMembersForTransfer(selectedMembers)
    setIsTransferModalOpen(true)
  }

  const handleTransferSuccess = () => {
    setSelectedMembers([])
    fetchMembers()
  }

  // Toggle selection for single member
  const toggleSelectMember = (member: CustomerDto) => {
    setSelectedMembers((prev) => {
      const exists = prev.some((c) => c.id === member.id)
      if (exists) {
        return prev.filter((c) => c.id !== member.id)
      } else {
        return [...prev, member]
      }
    })
  }

  // Toggle selection for all members
  const toggleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers([...members])
    }
  }

  if (isLoadingTeam) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-muted animate-pulse rounded-md" />
        <Card className="border-border/60">
          <CardContent className="h-40 flex items-center justify-center">
            <span className="text-muted-foreground animate-pulse font-semibold">Memuat detail tim...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If unauthorized to view this team
  if (team && !hasAccess) {
    return <ForbiddenPage />
  }

  if (!team) {
    return (
      <div className="space-y-6">
        <Link href="/teams" className="inline-flex items-center text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Tim
        </Link>
        <div className="text-center py-12 rounded-xl border border-dashed border-border bg-card">
          <h3 className="text-lg font-bold text-foreground">Tim Tidak Ditemukan</h3>
          <p className="text-sm text-muted-foreground mt-2">Tim yang Anda cari tidak dapat ditemukan atau telah dihapus.</p>
        </div>
      </div>
    )
  }

  // Define columns for members table
  const columns: ColumnDef<CustomerDto>[] = [
    {
      header: (
        <button 
          onClick={toggleSelectAll} 
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          type="button"
        >
          {selectedMembers.length === members.length && members.length > 0 ? (
            <CheckSquare className="h-4.5 w-4.5 text-primary" />
          ) : (
            <Square className="h-4.5 w-4.5" />
          )}
        </button>
      ),
      className: "w-[60px] text-center",
      render: (row) => {
        const isChecked = selectedMembers.some((c) => c.id === row.id)
        return (
          <button 
            onClick={() => toggleSelectMember(row)} 
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            type="button"
          >
            {isChecked ? (
              <CheckSquare className="h-4.5 w-4.5 text-primary animate-in zoom-in-75 duration-100" />
            ) : (
              <Square className="h-4.5 w-4.5" />
            )}
          </button>
        )
      }
    },
    {
      header: "Nama Peserta",
      accessorKey: "name",
      className: "font-semibold text-foreground min-w-[150px]",
    },
    {
      header: "Email",
      accessorKey: "email",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>{row.email}</span>
        </div>
      )
    },
    {
      header: "Gender",
      className: "w-[120px]",
      render: (row) => {
        const isPria = row.gender === "PRIA"
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
              isPria
                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400"
                : "bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400"
            }`}
          >
            {isPria ? "Ikhwan" : "Akhwat"}
          </span>
        )
      }
    },
    {
      header: "Pendidikan",
      accessorKey: "educationLevel",
      className: "text-center w-[100px]"
    },
    {
      header: "Angkatan",
      accessorKey: "entryYear",
      className: "text-center w-[100px]"
    },
    {
      header: "Aksi",
      className: "w-[130px] text-center",
      render: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleTransferSingle(row)}
          className="text-xs hover:bg-muted"
        >
          <ArrowLeftRight className="mr-1 h-3 w-3 text-indigo-500" />
          Pindahkan
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div>
        <Link href="/teams" className="inline-flex items-center text-sm font-semibold text-primary hover:underline transition-colors">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Kembali ke Daftar Tim
        </Link>
      </div>

      {/* Team Info Card */}
      <Card className="border-border/50 shadow-md overflow-hidden border-t-4 border-t-primary">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">{team.name}</h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary uppercase border border-primary/20">
                  {team.code}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="h-4.5 w-4.5 text-indigo-500" />
                  Kelas {team.grade}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4.5 w-4.5 text-rose-500" />
                  {team.campusName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4.5 w-4.5 text-sky-500" />
                  {members.length} Peserta Aktif
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full lg:w-auto">
              <Button 
                variant="outline" 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 lg:flex-none shadow-xs text-sm"
              >
                <Edit className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Tim
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDeleteTeam}
                className="flex-1 lg:flex-none shadow-xs text-sm hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 hover:border-rose-200"
              >
                <Trash2 className="mr-2 h-4 w-4 text-rose-500" /> Hapus Tim
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Members List Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Daftar Anggota Halaqah</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Daftar peserta mentoring yang tergabung dalam tim ini.</p>
          </div>

          {/* Bulk Transfer Button */}
          {selectedMembers.length > 0 && (
            <Button 
              onClick={handleTransferBulk}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md animate-in slide-in-from-top-2 duration-200"
            >
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Transfer Peserta ({selectedMembers.length})
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={members}
          isLoading={isLoadingMembers}
          skeletonRows={6}
          emptyMessage="Tidak ada peserta dalam tim ini."
        />
      </div>

      {/* Edit Form Modal */}
      <TeamFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        team={team}
        onSuccess={handleEditSuccess}
      />

      {/* Transfer Dialog Modal */}
      <TransferModal
        open={isTransferModalOpen}
        onOpenChange={setIsTransferModalOpen}
        selectedCustomers={selectedMembersForTransfer}
        onSuccess={handleTransferSuccess}
      />
    </div>
  )
}
