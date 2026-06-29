'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import authService from '@/services/auth.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type ResetFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setValue('token', token);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (values: ResetFormValues) => {
    setLoading(true);
    try {
      await authService.resetPassword(values);
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-extrabold text-white mb-6 text-center">Reset Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Reset Token"
          placeholder="Paste simulated token here"
          error={errors.token?.message}
          {...register('token')}
        />
        <Input
          label="New Password"
          placeholder="••••••••"
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
          Reset Password
        </Button>
      </form>
    </AuthLayout>
  );
}
