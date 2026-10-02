"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useRoleGuard } from '../../../hooks/use-role-guard';
import { customersApi } from '../../../lib/api/customers';
import { CustomerDto, Gender, EducationLevel, CustomerFilterParams } from '../../../types/api';
import { CustomerStats } from '../../../components/customers/customer-stats';
import { CustomerFilters } from '../../../components/customers/customer-filters';
import { CustomerTable } from '../../../components/customers/customer-table';
import { Pagination } from '../../../components/shared/pagination';
import { toast } from 'sonner';
import { UserCheck, Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { downloadExcel } from '../../../lib/download';

type SearchBy = 'ALL' | 'NAME' | 'EMAIL' | 'PHONE';

export default function CustomersPage() {
  useRoleGuard();
  const { isSuperAdmin, getCampusId } = useAuth();
  const myCampusId = getCampusId();

  // Filter States
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null);
  const [hasTeamFilter, setHasTeamFilter] = useState<boolean | null>(null);
  const [genderFilter, setGenderFilter] = useState<Gender | null>(null);
  const [educationLevelFilter, setEducationLevelFilter] = useState<EducationLevel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('ALL');

  // Pagination States
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Data States
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Active Campus ID based on role
  const activeCampusId = !isSuperAdmin ? myCampusId : selectedCampus;

  // Debounce search input (server-side search)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page whenever filters/search change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(0);
  }, [activeCampusId, hasTeamFilter, genderFilter, educationLevelFilter, debouncedSearch, searchBy, size]);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CustomerFilterParams = { page, size };
      if (activeCampusId !== null) params.campusId = activeCampusId;
      if (hasTeamFilter !== null) params.hasTeam = hasTeamFilter;
      if (genderFilter !== null) params.gender = genderFilter;
      if (educationLevelFilter !== null) params.educationLevel = educationLevelFilter;
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
        params.searchBy = searchBy;
      }

      const pageData = await customersApi.getCustomers(params);
      setCustomers(pageData.content || []);
      setTotalPages(pageData.totalPages ?? 0);
      setTotalElements(pageData.totalElements ?? 0);
    } catch (error) {
      console.error('Failed to fetch customers list', error);
      toast.error('Gagal memuat data peserta');
    } finally {
      setIsLoading(false);
    }
  }, [activeCampusId, hasTeamFilter, genderFilter, educationLevelFilter, debouncedSearch, searchBy, page, size]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchBy('ALL');
    setHasTeamFilter(null);
    setGenderFilter(null);
    setEducationLevelFilter(null);
    if (isSuperAdmin) {
      setSelectedCampus(null);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Menyiapkan file Excel...');
    try {
      const params: Record<string, unknown> = {};
      if (activeCampusId !== null) params.campusId = activeCampusId;
      if (hasTeamFilter !== null) params.hasTeam = hasTeamFilter;
      if (genderFilter !== null) params.gender = genderFilter;
      if (educationLevelFilter !== null) params.educationLevel = educationLevelFilter;
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
        params.searchBy = searchBy;
      }
      await downloadExcel(
        '/api/v1/customers/export',
        params,
        `peserta_${new Date().toISOString().split('T')[0]}.xlsx`
      );
      toast.success('File Excel berhasil diunduh', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengunduh file Excel', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Manajemen Peserta (Customer)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data mahasiswa/santri terdaftar, penugasan tim halaqah, dan status keanggotaan.
          </p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          className="w-full md:w-auto shadow-sm"
        >
          <Download className={`h-4 w-4 mr-2 ${isExporting ? "animate-pulse" : ""}`} />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <CustomerStats campusId={activeCampusId} />

      {/* Filters Section */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchBy={searchBy}
        onSearchByChange={setSearchBy}
        selectedCampusId={selectedCampus}
        onCampusChange={setSelectedCampus}
        hasTeamFilter={hasTeamFilter}
        onHasTeamChange={setHasTeamFilter}
        genderFilter={genderFilter}
        onGenderChange={setGenderFilter}
        educationLevelFilter={educationLevelFilter}
        onEducationLevelChange={setEducationLevelFilter}
        onResetFilters={handleResetFilters}
      />

      {/* Data Table Section */}
      <div className="space-y-2">
        <CustomerTable
          customers={customers}
          isLoading={isLoading}
          onRefresh={fetchCustomers}
        />
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
    </div>
  );
}
