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

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-center gap-3 bg-card p-4 rounded-lg border">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px] w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari nama atau email peserta..."
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
