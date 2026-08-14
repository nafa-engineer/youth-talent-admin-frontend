"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from 'src/components/auth/reset-password-form';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col items-center">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
        <ResetPasswordContent />
      </Suspense>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}