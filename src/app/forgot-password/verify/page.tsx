'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import authService from '@/services/auth.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

function VerifyPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('identifier') || searchParams.get('mobile') || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds

  // Step 1 States
  const [otp, setOtp] = useState('');

  // Step 2 States
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (!identifier) {
      toast.error('Identifier is missing. Please start again.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyResetOtp({ identifier, otp });
      toast.success('OTP verified! Choose your new password.');
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPasswordMobile({
        identifier,
        otp,
        password,
      });
      toast.success('Password reset successful! Please log in.');
      router.push('/login');
    } catch (err: any) {
      toast.error(err.message || 'Password reset failed.');
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

  if (step === 1) {
    return (
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
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
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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

        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={countdown === 0}
          className="w-full mt-2"
        >
          Verify OTP Code
        </Button>

        <p className="text-xs text-center text-gray-500 font-bold mt-2 uppercase">
          <Link href="/login" className="text-gameAccent hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    );
  }

  // Step 2: New Password Form
  return (
    <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
      <Input
        label="New Password"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        label="Confirm New Password"
        placeholder="••••••••"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        type="submit"
        variant="primary"
        isLoading={loading}
        className="w-full mt-2"
      >
        Reset Password
      </Button>

      <p className="text-xs text-center text-gray-500 font-bold mt-2 uppercase">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-gameAccent hover:underline focus:outline-none"
        >
          Go Back
        </button>
      </p>
    </form>
  );
}

export default function VerifyForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-xs text-gray-400 font-semibold">Loading parameters...</div>}>
      <AuthLayout>
        <h2 className="text-xl font-extrabold text-white mb-2 text-center">Verify Reset OTP</h2>
        <p className="text-xs text-gray-400 font-semibold text-center mb-6 leading-relaxed">
          Verify the reset code sent to your account and choose a new password.
        </p>
        <VerifyPasswordContent />
      </AuthLayout>
    </Suspense>
  );
}
