"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from 'src/components/auth/reset-password-form';

function CoachResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  return <ResetPasswordForm token={token} isCoach />;
}

export default function CoachResetPasswordPage() {
  return (
    <div className="flex flex-col items-center">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Memuat...</div>}>
        <CoachResetPasswordContent />
      </Suspense>
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}
