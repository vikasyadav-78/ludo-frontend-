'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import authService from '@/services/auth.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

const verifyResetSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type VerifyResetFormValues = z.infer<typeof verifyResetSchema>;

function VerifyPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || searchParams.get('mobile') || '';

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyResetFormValues>({
    resolver: zodResolver(verifyResetSchema),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (values: VerifyResetFormValues) => {
    if (!identifier) {
      toast.error('Verification identifier is missing. Please start again.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPasswordMobile({
        identifier,
        otp: values.otp,
        password: values.password,
      });
      toast.success('Password reset successful! Please log in with your new password.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Verification or password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !identifier) return;
    setLoading(true);
    try {
      await authService.forgotPassword(identifier);
      setCountdown(300);
      setResendCooldown(60);
      toast.success('Reset OTP sent successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isEmail = identifier.includes('@');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label={isEmail ? "Email Address" : "Mobile Number"}
        value={identifier}
        disabled
        className="opacity-60 cursor-not-allowed font-bold"
      />

      <div className="flex flex-col gap-1.5">
        <Input
          label="OTP Code"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          error={errors.otp?.message}
          {...register('otp')}
        />
        <div className="flex justify-between items-center text-xs mt-0.5">
          <span className="text-gray-500 font-bold">
            Expires in: <span className="text-red-400 font-mono">{formatCountdown(countdown)}</span>
          </span>
          {resendCooldown > 0 ? (
            <span className="text-gray-500 font-semibold">
              Resend in: <span className="font-bold">{resendCooldown}s</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="text-gameAccent hover:underline font-bold focus:outline-none disabled:opacity-50"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>

      <Input
        label="New Password"
        placeholder="••••••••"
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirm Password"
        placeholder="••••••••"
        type="password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        disabled={countdown === 0}
        className="w-full mt-2"
      >
        Reset Password
      </Button>

      <p className="text-xs text-center text-gray-500 font-bold mt-2 uppercase">
        <Link href="/login" className="text-gameAccent hover:underline">
          Back to Login
        </Link>
      </p>
    </form>
  );
}

export default function VerifyForgotPasswordPage() {
  return (
    <AuthLayout>
      <h2 className="text-xl font-extrabold text-white mb-2 text-center">Verify Reset OTP</h2>
      <p className="text-xs text-gray-400 font-semibold text-center mb-6 leading-relaxed">
        Verify the reset code sent to your account and choose a new password.
      </p>
      <Suspense fallback={<div className="text-center text-xs text-gray-400 font-semibold">Loading parameters...</div>}>
        <VerifyPasswordContent />
      </Suspense>
    </AuthLayout>
  );
}
