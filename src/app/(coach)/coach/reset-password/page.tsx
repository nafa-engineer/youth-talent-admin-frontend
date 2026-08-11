"use client";

import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from 'src/components/auth/reset-password-form';

export default function CoachResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  return (
    <div className="flex flex-col items-center">
      <ResetPasswordForm token={token} isCoach />
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}
