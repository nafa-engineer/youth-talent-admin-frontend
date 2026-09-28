"use client";

import React from 'react';
import { CampusFilter } from '../shared/campus-filter';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { GENDER_OPTIONS, EDUCATION_LEVEL_OPTIONS } from '../../lib/constants';
import { Gender, EducationLevel } from '../../types/api';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/button';

interface CustomerFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchBy: 'ALL' | 'NAME' | 'EMAIL' | 'PHONE';
  onSearchByChange: (value: 'ALL' | 'NAME' | 'EMAIL' | 'PHONE') => void;
  selectedCampusId: number | null;
  onCampusChange: (campusId: number | null) => void;
  hasTeamFilter: boolean | null;
  onHasTeamChange: (hasTeam: boolean | null) => void;
  genderFilter: Gender | null;
  onGenderChange: (gender: Gender | null) => void;
  educationLevelFilter: EducationLevel | null;
  onEducationLevelChange: (educationLevel: EducationLevel | null) => void;
  onResetFilters: () => void;
}

export function CustomerFilters({
  searchQuery,
  onSearchChange,
  searchBy,
  onSearchByChange,
  selectedCampusId,
  onCampusChange,
  hasTeamFilter,
  onHasTeamChange,
  genderFilter,
  onGenderChange,
  educationLevelFilter,
  onEducationLevelChange,
  onResetFilters,
}: CustomerFiltersProps) {
  const hasActiveFilters =
    searchQuery !== '' ||
    hasTeamFilter !== null ||
    genderFilter !== null ||
    educationLevelFilter !== null;

  const hasTeamItems = {
    ALL: 'Semua Status Tim',
    HAS_TEAM: 'Sudah Punya Tim',
    NO_TEAM: 'Belum Punya Tim',
  };
  const genderItems = {
    ALL: 'Semua Gender',
    ...Object.fromEntries(GENDER_OPTIONS.map((g) => [g.value, g.label])),
  };
  const educationItems = {
    ALL: 'Semua Jenjang',
    ...Object.fromEntries(EDUCATION_LEVEL_OPTIONS.map((e) => [e.value, e.label])),
  };
  const searchByItems = {
    ALL: 'Semua Kolom',
    NAME: 'Nama',
    EMAIL: 'Email',
    PHONE: 'No. HP',
  };
  const searchPlaceholder =
    searchBy === 'NAME'
      ? 'Cari nama peserta...'
      : searchBy === 'EMAIL'
        ? 'Cari email peserta...'
        : searchBy === 'PHONE'
          ? 'Cari nomor HP peserta...'
          : 'Cari nama, email, atau no. HP...';

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 bg-card p-4 rounded-lg border">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search By */}
      <div className="w-full md:w-[150px]">
        <Select
          value={searchBy}
          onValueChange={(val) => onSearchByChange(val as 'ALL' | 'NAME' | 'EMAIL' | 'PHONE')}
          items={searchByItems}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Cari Berdasarkan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Kolom</SelectItem>
            <SelectItem value="NAME">Nama</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="PHONE">No. HP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campus Filter */}
      <div className="w-full md:w-[180px]">
        <CampusFilter
          value={selectedCampusId}
          onChange={onCampusChange}
          className="w-full"
        />
      </div>

      {/* Status Tim Filter */}
      <div className="w-full md:w-[170px]">
        <Select
          value={hasTeamFilter === null ? 'ALL' : hasTeamFilter ? 'HAS_TEAM' : 'NO_TEAM'}
          onValueChange={(val) => {
            if (val === 'ALL') onHasTeamChange(null);
            else if (val === 'HAS_TEAM') onHasTeamChange(true);
            else if (val === 'NO_TEAM') onHasTeamChange(false);
          }}
          items={hasTeamItems}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status Tim" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status Tim</SelectItem>
            <SelectItem value="HAS_TEAM">Sudah Punya Tim</SelectItem>
            <SelectItem value="NO_TEAM">Belum Punya Tim</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gender Filter */}
      <div className="w-full md:w-[150px]">
        <Select
          value={genderFilter === null ? 'ALL' : genderFilter}
          onValueChange={(val) => onGenderChange(val === 'ALL' ? null : (val as Gender))}
          items={genderItems}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Gender</SelectItem>
            {GENDER_OPTIONS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Education Level Filter */}
      <div className="w-full md:w-[160px]">
        <Select
          value={educationLevelFilter === null ? 'ALL' : educationLevelFilter}
          onValueChange={(val) => onEducationLevelChange(val === 'ALL' ? null : (val as EducationLevel))}
          items={educationItems}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pendidikan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Jenjang</SelectItem>
            {EDUCATION_LEVEL_OPTIONS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" /> Reset Filter
        </Button>
      )}
    </div>
  );
}
