"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import Image from 'next/image';
import { authApi } from '../../lib/api/auth';
import { ROUTES } from '../../lib/constants';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  isCoach?: boolean;
}

export function ForgotPasswordForm({ isCoach = false }: ForgotPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [email, setEmailState] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isCoach) {
        await authApi.coachForgotPassword(data.email);
      } else {
        await authApi.forgotPassword(data.email);
      }
      setEmailState(data.email);
      setSuccess(true);
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } } };
      toast.error(err.response?.data?.responseMessage || 'Gagal mengirim link reset kata sandi');
    } finally {
      setIsLoading(false);
    }
  };

  const loginRoute = isCoach ? ROUTES.COACH_LOGIN : ROUTES.LOGIN;

  if (success) {
    return (
      <Card className="w-full shadow-lg border-primary/20">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold">Email Terkirim!</h2>
          <p className="text-sm text-muted-foreground">
            Link reset kata sandi telah dikirim ke <strong>{email}</strong>. Silakan cek inbox Anda.
          </p>
          <Link href={loginRoute}>
            <Button className="w-full mt-2">Kembali ke Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-primary/20">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/yt.jpeg"
            alt="YouthTalent Logo"
            width={64}
            height={64}
            className="rounded-full object-cover shadow-sm border border-primary/20"
          />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">
          Lupa Kata Sandi
        </CardTitle>
        <CardDescription>
          Masukkan email Anda untuk menerima link reset kata sandi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@youthtalent.id"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
          </Button>
          <div className="text-center">
            <Link href={loginRoute} className="text-sm text-primary hover:underline">
              Kembali ke Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
