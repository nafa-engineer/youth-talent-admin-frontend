import { ForgotPasswordForm } from 'src/components/auth/forgot-password-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi - YouthTalent Admin',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center">
      <ForgotPasswordForm />
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}
