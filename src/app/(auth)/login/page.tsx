import { LoginForm } from 'src/components/auth/login-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - YouthTalent Admin',
  description: 'Masuk ke dashboard admin YouthTalent',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      <LoginForm />
      <div className="mt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Nafa YouthTalent. All rights reserved.
      </div>
    </div>
  );
}
