"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { useRoleGuard } from '../../../hooks/use-role-guard';
import { customersApi } from '../../../lib/api/customers';
import { CustomerDto, Gender, EducationLevel, CustomerFilterParams } from '../../../types/api';
import { CustomerStats } from '../../../components/customers/customer-stats';
import { CustomerFilters } from '../../../components/customers/customer-filters';
import { CustomerTable } from '../../../components/customers/customer-table';
import { toast } from 'sonner';
import { UserCheck } from 'lucide-react';

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

  // Data States
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Campus ID based on role
  const activeCampusId = !isSuperAdmin ? myCampusId : selectedCampus;

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CustomerFilterParams = {};
      if (activeCampusId !== null) params.campusId = activeCampusId;
      if (hasTeamFilter !== null) params.hasTeam = hasTeamFilter;
      if (genderFilter !== null) params.gender = genderFilter;
      if (educationLevelFilter !== null) params.educationLevel = educationLevelFilter;

      const pageData = await customersApi.getCustomers(params);
      setCustomers(pageData.content || []);
    } catch (error) {
      console.error('Failed to fetch customers list', error);
      toast.error('Gagal memuat data peserta');
    } finally {
      setIsLoading(false);
    }
  }, [activeCampusId, hasTeamFilter, genderFilter, educationLevelFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  // Client-side search filtering by name, email, institution, domicile
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.institutionName && c.institutionName.toLowerCase().includes(query)) ||
        (c.domicile && c.domicile.toLowerCase().includes(query)) ||
        (c.teamName && c.teamName.toLowerCase().includes(query))
    );
  }, [customers, searchQuery]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setHasTeamFilter(null);
    setGenderFilter(null);
    setEducationLevelFilter(null);
    if (isSuperAdmin) {
      setSelectedCampus(null);
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
      </div>

      {/* Summary Cards */}
      <CustomerStats campusId={activeCampusId} />

      {/* Filters Section */}
      <CustomerFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
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
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-medium text-muted-foreground">
            Menampilkan {filteredCustomers.length} dari {customers.length} data peserta
          </span>
        </div>
        <CustomerTable
          customers={filteredCustomers}
          isLoading={isLoading}
          onRefresh={fetchCustomers}
        />
      </div>
    </div>
  );
}
