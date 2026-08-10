import { CoachLoginForm } from 'src/components/auth/coach-login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login Coach - YouthTalent',
  description: 'Masuk ke dashboard coach YouthTalent',
};

export default function CoachLoginPage() {
  return (
    <div className="flex flex-col items-center">
      <CoachLoginForm />
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}