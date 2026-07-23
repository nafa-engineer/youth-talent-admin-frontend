"use client";

import React, { useState } from 'react';
import { CustomerDto } from '../../types/api';
import { DataTable, ColumnDef } from '../shared/data-table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowLeftRight, User, UserCheck } from 'lucide-react';
import { TransferModal } from '../teams/transfer-modal';

interface CustomerTableProps {
  customers: CustomerDto[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function CustomerTable({ customers, isLoading, onRefresh }: CustomerTableProps) {
  const [selectedCustomers, setSelectedCustomers] = useState<CustomerDto[]>([]);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const handleOpenTransferSingle = (customer: CustomerDto) => {
    setSelectedCustomers([customer]);
    setIsTransferOpen(true);
  };

  const columns: ColumnDef<CustomerDto>[] = [
    {
      header: 'No',
      className: 'w-12 text-center',
      render: (_, index) => <span className="text-muted-foreground text-xs">{index + 1}</span>,
    },
    {
      header: 'Nama Peserta',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            row.gender === 'PRIA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
          }`}>
            {row.gender === 'PRIA' ? <User className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-foreground text-sm">{row.name}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Gender',
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.gender === 'PRIA'
              ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
              : 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300'
          }
        >
          {row.gender === 'PRIA' ? 'Ikhwan' : 'Akhwat'}
        </Badge>
      ),
    },
    {
      header: 'Pendidikan / Angkatan',
      render: (row) => (
        <div>
          <div className="text-sm font-medium">{row.educationLevel || '-'}</div>
          <div className="text-xs text-muted-foreground">
            {row.institutionName ? `${row.institutionName} • ` : ''}Angkatan {row.entryYear || '-'}
          </div>
        </div>
      ),
    },
    {
      header: 'Domisili / Asal',
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <div><span className="text-muted-foreground">Domisili:</span> {row.domicile || '-'}</div>
          <div><span className="text-muted-foreground">Asal:</span> {row.origin || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Tim / Kampus',
      render: (row) => (
        <div className="space-y-1">
          <div>
            {row.teamName ? (
              <Badge variant="secondary" className="font-medium">
                {row.teamName}
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/30">
                Belum Punya Tim
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.campusName || 'Tanpa Kampus'}
          </div>
        </div>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right w-32',
      render: (row) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={() => handleOpenTransferSingle(row)}
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
            {row.teamName ? 'Pindah Tim' : 'Assign Tim'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        isLoading={isLoading}
        emptyMessage="Tidak ada data peserta yang sesuai filter."
      />

      <TransferModal
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        selectedCustomers={selectedCustomers}
        onSuccess={() => {
          onRefresh();
          setSelectedCustomers([]);
        }}
      />
    </>
  );
}
