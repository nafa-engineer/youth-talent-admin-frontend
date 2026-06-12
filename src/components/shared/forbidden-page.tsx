import React from 'react';
import { Button } from '../ui/button';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '../../lib/constants';

export function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-destructive/10 p-4 rounded-full mb-6">
        <ShieldAlert className="w-16 h-16 text-destructive" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
        Akses Ditolak
      </h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya diperuntukkan bagi Super Admin.
      </p>
      <Button 
        onClick={() => router.push(ROUTES.DASHBOARD)}
        className="bg-primary hover:bg-primary/90"
      >
        Kembali ke Dashboard
      </Button>
    </div>
  );
}
