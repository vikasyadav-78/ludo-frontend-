'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import authService from '@/services/auth.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email Address or Mobile Number is required').refine((val) => {
    const isMobile = /^\d{10}$/.test(val);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return isMobile || isEmail;
  }, {
    message: 'Please enter a valid Email Address or 10-digit Mobile Number',
  }),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const data = await authService.login(values);

      // Save token in cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax; Secure`;

      // Save refresh token in local storage
      localStorage.setItem('refreshToken', data.refreshToken);

      // Save in Redux store
      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success('Successfully logged in!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-extrabold text-white mb-6 text-center">Log In</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email Address or Mobile Number"
          placeholder="e.g. player@battleludo.com or 9876543210"
          type="text"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <div className="flex flex-col gap-1">
          <Input
            label="Password"
            placeholder="••••••••"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-gameAccent hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
          Log In
        </Button>

        <p className="text-xs text-center text-gray-500 font-bold mt-4 uppercase">
          New to Arena?{' '}
          <Link href="/register" className="text-gameAccent hover:underline">
            Register Here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
