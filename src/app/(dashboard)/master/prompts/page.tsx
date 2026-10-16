"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "../../../../hooks/use-role-guard";
import { promptsApi } from "../../../../lib/api/prompts";
import { FillinPromptDto, FillinPromptRequestDto, PromptAudience } from "../../../../types/api";
import { DataTable, ColumnDef } from "../../../../components/shared/data-table";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Megaphone } from "lucide-react";

const EMPTY_FORM: FillinPromptRequestDto = {
  code: "",
  title: "",
  message: "",
  ctaLabel: "",
  ctaAction: "",
  audience: "CUSTOMER",
  isActive: true,
  dismissible: true,
  displayOrder: 0,
  startAt: null,
  endAt: null,
};

export default function PromptsPage() {
  useRoleGuard(true);

  const [prompts, setPrompts] = useState<FillinPromptDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FillinPromptRequestDto>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);
    try {
      setPrompts(await promptsApi.getAll());
    } catch (error) {
      console.error("Failed to fetch prompts", error);
      toast.error("Gagal memuat daftar banner");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPrompts();
  }, [fetchPrompts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (prompt: FillinPromptDto) => {
    setEditingId(prompt.id);
    setForm({
      code: prompt.code,
      title: prompt.title,
      message: prompt.message ?? "",
      ctaLabel: prompt.ctaLabel ?? "",
      ctaAction: prompt.ctaAction ?? "",
      audience: prompt.audience,
      isActive: prompt.isActive,
      dismissible: prompt.dismissible,
      displayOrder: prompt.displayOrder ?? 0,
      startAt: prompt.startAt,
      endAt: prompt.endAt,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      toast.error("Kode dan judul wajib diisi");
      return;
    }
    setIsSaving(true);
    try {
      const payload: FillinPromptRequestDto = {
        ...form,
        message: form.message || null,
        ctaLabel: form.ctaLabel || null,
        ctaAction: form.ctaAction || null,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
      };
      if (editingId) {
        await promptsApi.update(editingId, payload);
        toast.success("Banner diperbarui");
      } else {
        await promptsApi.create(payload);
        toast.success("Banner dibuat");
      }
      setIsDialogOpen(false);
      fetchPrompts();
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } } };
      toast.error(err.response?.data?.responseMessage || "Gagal menyimpan banner");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (prompt: FillinPromptDto) => {
    if (!confirm(`Hapus banner "${prompt.title}"?`)) return;
    try {
      await promptsApi.remove(prompt.id);
      toast.success("Banner dihapus");
      fetchPrompts();
    } catch {
      toast.error("Gagal menghapus banner");
    }
  };

  const columns: ColumnDef<FillinPromptDto>[] = [
    {
      header: "Judul",
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.title}</div>
          <div className="text-xs text-muted-foreground">{row.code}</div>
        </div>
      ),
    },
    {
      header: "Audience",
      render: (row) => <Badge variant="outline">{row.audience}</Badge>,
    },
    {
      header: "Status",
      render: (row) => (
        <Badge variant={row.isActive ? "secondary" : "destructive"}>
          {row.isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      header: "Periode",
      render: (row) => (
        <div className="text-xs text-muted-foreground">
          {row.startAt ? row.startAt.replace("T", " ").slice(0, 16) : "-"} s.d.{" "}
          {row.endAt ? row.endAt.replace("T", " ").slice(0, 16) : "-"}
        </div>
      ),
    },
    {
      header: "Urutan",
      className: "w-20 text-center",
      render: (row) => <span className="text-sm">{row.displayOrder ?? 0}</span>,
    },
    {
      header: "Aksi",
      className: "text-right w-28",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(row)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Banner &amp; Pengisian
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola banner/prompt yang tampil ke pengguna (mis. ajakan melengkapi domisili).
          </p>
        </div>
        <Button onClick={openCreate} className="w-full md:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Tambah Banner
        </Button>
      </div>

      <DataTable columns={columns} data={prompts} isLoading={isLoading} emptyMessage="Belum ada banner." />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Banner" : "Tambah Banner"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Kode</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="lengkapi_domisili"
                  disabled={!!editingId}
                />
              </div>
              <div>
                <Label>Audience</Label>
                <select
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as PromptAudience })}
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="COACH">COACH</option>
                </select>
              </div>
            </div>

            <div>
              <Label>Judul</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <Label>Pesan</Label>
              <Input value={form.message ?? ""} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Label CTA</Label>
                <Input
                  value={form.ctaLabel ?? ""}
                  onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                  placeholder="Isi sekarang"
                />
              </div>
              <div>
                <Label>Aksi CTA</Label>
                <select
                  className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={form.ctaAction ?? ""}
                  onChange={(e) => setForm({ ...form, ctaAction: e.target.value })}
                >
                  <option value="">(tanpa aksi)</option>
                  <option value="OPEN_PROFILE_DOMISILE">OPEN_PROFILE_DOMISILE</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mulai (opsional)</Label>
                <Input
                  type="datetime-local"
                  value={form.startAt ? form.startAt.slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value || null })}
                />
              </div>
              <div>
                <Label>Selesai (opsional)</Label>
                <Input
                  type="datetime-local"
                  value={form.endAt ? form.endAt.slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value || null })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 items-center">
              <div>
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={form.displayOrder ?? 0}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm mt-5">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Aktif
              </label>
              <label className="flex items-center gap-2 text-sm mt-5">
                <input
                  type="checkbox"
                  checked={form.dismissible ?? true}
                  onChange={(e) => setForm({ ...form, dismissible: e.target.checked })}
                />
                Bisa ditutup
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
