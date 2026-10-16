"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRoleGuard } from "../../../../hooks/use-role-guard";
import { districtMapApi } from "../../../../lib/api/district-map";
import { campusesApi } from "../../../../lib/api/campuses";
import { CampusDto, DistrictCampusMapDto } from "../../../../types/api";
import { DataTable, ColumnDef } from "../../../../components/shared/data-table";
import { Pagination } from "../../../../components/shared/pagination";
import { Input } from "../../../../components/ui/input";
import { toast } from "sonner";
import { Search, MapPin } from "lucide-react";

export default function DistrictMapPage() {
  useRoleGuard(true);

  const [rows, setRows] = useState<DistrictCampusMapDto[]>([]);
  const [campuses, setCampuses] = useState<CampusDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    campusesApi.getCampuses().then(setCampuses).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [debouncedSearch, size]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await districtMapApi.list({
        search: debouncedSearch.trim() || undefined,
        page,
        size,
      });
      setRows(data.content || []);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } catch (error) {
      console.error("Failed to fetch district mapping", error);
      toast.error("Gagal memuat mapping wilayah");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, size]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleCampusChange = async (row: DistrictCampusMapDto, campusId: string) => {
    try {
      if (!campusId) {
        await districtMapApi.remove(row.districtCode);
        toast.success(`Mapping ${row.districtName} dihapus`);
      } else {
        await districtMapApi.set({ districtCode: row.districtCode, campusId: Number(campusId) });
        toast.success(`Mapping ${row.districtName} disimpan`);
      }
      fetchData();
    } catch {
      toast.error("Gagal menyimpan mapping");
    }
  };

  const columns: ColumnDef<DistrictCampusMapDto>[] = [
    { header: "No", className: "w-12 text-center", render: (_, i) => <span className="text-xs text-muted-foreground">{page * size + i + 1}</span> },
    {
      header: "Kecamatan",
      render: (row) => (
        <div>
          <div className="font-medium text-sm">{row.districtName}</div>
          <div className="text-xs text-muted-foreground">{row.cityName}, {row.provinceName}</div>
        </div>
      ),
    },
    {
      header: "Kampus",
      render: (row) => (
        <select
          className="w-full max-w-[240px] h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          value={row.campusId ?? ""}
          onChange={(e) => handleCampusChange(row, e.target.value)}
        >
          <option value="">— Belum dipetakan —</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Mapping Wilayah → Kampus
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Petakan setiap kecamatan ke kampus. Berguna untuk melihat cakupan dan rekomendasi kampus berdasarkan domisili.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari kecamatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <DataTable columns={columns} data={rows} isLoading={isLoading} emptyMessage="Tidak ada kecamatan." />

      <Pagination
        page={page}
        pageSize={size}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onPageSizeChange={setSize}
        isLoading={isLoading}
      />
    </div>
  );
}
