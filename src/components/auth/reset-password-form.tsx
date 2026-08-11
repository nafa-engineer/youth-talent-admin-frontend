"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authApi } from '../../lib/api/auth';
import { ROUTES } from '../../lib/constants';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

const schema = z.object({
  newPassword: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
  confirmPassword: z.string().min(1, { message: "Konfirmasi kata sandi wajib diisi" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

interface ResetPasswordFormProps {
  token: string;
  isCoach?: boolean;
}

export function ResetPasswordForm({ token, isCoach = false }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isCoach) {
        await authApi.coachResetPassword(token, data.newPassword);
      } else {
        await authApi.resetPassword(token, data.newPassword);
      }
      toast.success('Kata sandi berhasil diubah! Silakan login.');
      router.push(isCoach ? ROUTES.COACH_LOGIN : ROUTES.LOGIN);
    } catch (error) {
      const err = error as { response?: { data?: { responseMessage?: string } } };
      toast.error(err.response?.data?.responseMessage || 'Gagal mengubah kata sandi');
    } finally {
      setIsLoading(false);
    }
  };

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
          Reset Kata Sandi
        </CardTitle>
        <CardDescription>
          Masukkan kata sandi baru Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="*********"
              {...register('newPassword')}
              disabled={isLoading}
            />
            {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="*********"
              {...register('confirmPassword')}
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
