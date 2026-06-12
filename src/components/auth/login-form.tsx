"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { authApi } from '../../lib/api/auth';
import { ROUTES } from '../../lib/constants';
import { UserRole } from '../../types/auth';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Kata sandi wajib diisi" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      // Construct AuthUser from response
      const authUser = {
        email: response.email,
        name: response.name,
        type: response.type as UserRole, // Cast to UserRole
        campusId: response.campusId,
        campusName: response.campusName,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      };
      
      login(authUser);
      toast.success('Login berhasil!');
      router.push(ROUTES.DASHBOARD);
    } catch (error) {
      console.error('Login error:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Gagal melakukan login. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border-primary/20">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">YT</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-primary">YouthTalent Admin</CardTitle>
        <CardDescription>
          Masukkan kredensial Anda untuk mengakses dashboard
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Kata Sandi</Label>
            </div>
            <Input 
              id="password" 
              type="password"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
