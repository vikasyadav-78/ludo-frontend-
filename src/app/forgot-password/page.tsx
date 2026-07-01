'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import authService from '@/services/auth.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email Address or Mobile Number is required').refine((val) => {
    const isMobile = /^\d{10}$/.test(val);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    return isMobile || isEmail;
  }, {
    message: 'Please enter a valid Email Address or 10-digit Mobile Number',
  }),
});

type ForgotFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotFormValues) => {
    setLoading(true);
    try {
      const data = await authService.forgotPassword(values.identifier);
      toast.success(data.message || 'OTP sent successfully!');
      const resolvedIdentifier = data.target || values.identifier;
      router.push(`/forgot-password/verify?identifier=${encodeURIComponent(resolvedIdentifier)}`);
    } catch (err: any) {
      toast.error(err.message || 'Error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="text-xl font-extrabold text-white mb-6 text-center">Forgot Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-xs text-gray-400 font-semibold leading-relaxed mb-2 text-center">
          Enter your Email Address or Mobile Number and we will send a 6-digit OTP code to verify and reset your password.
        </p>
        <Input
          label="Email or Mobile Number"
          placeholder="e.g. player@battleludo.com or 9876543210"
          type="text"
          error={errors.identifier?.message}
          {...register('identifier')}
        />
        <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
          Send Verification OTP
        </Button>

        <p className="text-xs text-center text-gray-500 font-bold mt-4 uppercase">
          Remember Password?{' '}
          <Link href="/login" className="text-gameAccent hover:underline">
            Log In
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
