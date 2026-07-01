'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials } from '@/features/auth/authSlice';
import { setSettings, setSettingsLoading, setSettingsError } from '@/features/settings/settingsSlice';
import authService from '@/services/auth.service';
import settingsService from '@/services/settings.service';
import AuthLayout from '@/layouts/AuthLayout';
import Input from '@/components/Input';
import Button from '@/components/Button';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (must be 10 digits starting with 6-9)'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  referralCode: z.string().optional(),
  agree: z.boolean().refine((val) => val === true, 'You must agree to the Terms & Conditions and Privacy Policy'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { values: settings } = useAppSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Timers for Step 2
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(60); // 60 seconds

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agree: false,
    }
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch(setSettingsLoading(true));
        const publicSettings = await settingsService.getPublicSettings();
        dispatch(setSettings(publicSettings));
      } catch (error: any) {
        dispatch(setSettingsError(error.message || 'Failed to load settings'));
      } finally {
        dispatch(setSettingsLoading(false));
      }
    };

    loadSettings();
  }, [dispatch]);

  // Restore fields from sessionStorage if they exist (excluding password)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('reg_name');
      const storedEmail = sessionStorage.getItem('reg_email');
      const storedMobile = sessionStorage.getItem('reg_mobile');
      const storedReferral = sessionStorage.getItem('reg_referralCode');

      if (storedName) setValue('name', storedName);
      if (storedEmail) setValue('email', storedEmail);
      if (storedMobile) setValue('mobile', storedMobile);
      if (storedReferral) setValue('referralCode', storedReferral);

      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
        setValue('referralCode', ref);
        toast.success(`Referral code "${ref}" auto-filled!`);
      }
    }
  }, [setValue]);

  // Timers effect for Step 2
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      // 1. Call send OTP endpoint
      const res = await authService.registerSendOtp(values);

      // 2. Save values (strictly excluding password) in sessionStorage
      sessionStorage.setItem('reg_name', values.name);
      sessionStorage.setItem('reg_email', values.email);
      sessionStorage.setItem('reg_mobile', values.mobile);
      if (values.referralCode) {
        sessionStorage.setItem('reg_referralCode', values.referralCode);
      } else {
        sessionStorage.removeItem('reg_referralCode');
      }

      // Check backend response message or settings to determine the provider
      const provider = (settings.OTP_PROVIDER || 'twilio').toLowerCase();
      const isEmailProvider = res.message?.toLowerCase().includes('email') || provider === 'email';
      sessionStorage.setItem('reg_otp_provider', isEmailProvider ? 'email' : 'sms');

      // 3. Keep password strictly in memory React state
      setPassword(values.password);

      // 4. Move to OTP Verification step and reset timers
      setCountdown(300);
      setResendCooldown(60);
      setStep(2);
      
      toast.success(
        isEmailProvider
          ? 'Verification OTP sent to your email address!'
          : 'Verification OTP sent to your mobile number!'
      );
    } catch (err: any) {
      toast.error(err.message || 'Validation/OTP request failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const storedName = sessionStorage.getItem('reg_name') || getValues('name') || '';
      const storedEmail = sessionStorage.getItem('reg_email') || getValues('email') || '';
      const storedMobile = sessionStorage.getItem('reg_mobile') || getValues('mobile') || '';
      const storedReferral = sessionStorage.getItem('reg_referralCode') || getValues('referralCode') || '';

      const data = await authService.registerVerifyOtp({
        name: storedName,
        email: storedEmail,
        mobile: storedMobile,
        password, // securely passed from React memory state
        referralCode: storedReferral || undefined,
        otp,
      });

      // Save token in cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax; Secure`;

      // Save credentials in Redux
      dispatch(setCredentials({ user: data.user, token: data.token }));

      toast.success('Successfully registered and verified!');

      // Clear register details from sessionStorage
      sessionStorage.removeItem('reg_name');
      sessionStorage.removeItem('reg_email');
      sessionStorage.removeItem('reg_mobile');
      sessionStorage.removeItem('reg_referralCode');

      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'OTP Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const storedName = sessionStorage.getItem('reg_name') || getValues('name') || '';
      const storedEmail = sessionStorage.getItem('reg_email') || getValues('email') || '';
      const storedMobile = sessionStorage.getItem('reg_mobile') || getValues('mobile') || '';
      const storedReferral = sessionStorage.getItem('reg_referralCode') || getValues('referralCode') || '';

      await authService.registerSendOtp({
        name: storedName,
        email: storedEmail,
        mobile: storedMobile,
        password, // securely passed from React memory state
        referralCode: storedReferral || undefined,
        agree: true,
      });

      setCountdown(300);
      setResendCooldown(60);
      toast.success('Verification OTP resent successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const welcomeBonusAmount = Number(settings.WELCOME_BONUS_AMOUNT || 0);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <AuthLayout>
      {step === 1 ? (
        <>
          <h2 className="text-xl font-extrabold text-white mb-2 text-center">Register</h2>
          <p className="text-xs text-gameAccent font-bold text-center mb-6 uppercase tracking-wider">
            🎁 Register now and get ₹{welcomeBonusAmount} Welcome Bonus instantly.
          </p>

          <form onSubmit={handleSubmit(onRegisterSubmit)} className="flex flex-col gap-4">
            <Input
              label="Name"
              placeholder="e.g. John Doe"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email Address"
              placeholder="e.g. player@battleludo.com"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mobile Number"
              placeholder="e.g. 9876543210"
              type="tel"
              maxLength={10}
              error={errors.mobile?.message}
              {...register('mobile')}
            />
            <Input
              label="Password"
              placeholder="••••••••"
              type="password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Referral Code (Optional)"
              placeholder="e.g. VIKAS8787"
              error={errors.referralCode?.message}
              {...register('referralCode')}
            />

            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="agree"
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-gameCard/50 text-gameAccent focus:ring-gameAccent focus:ring-offset-0 focus:outline-none"
                  {...register('agree')}
                />
                <label htmlFor="agree" className="text-xs text-gray-400 font-semibold select-none leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-gameAccent hover:underline font-bold">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-gameAccent hover:underline font-bold">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.agree && <span className="text-xs text-red-400 font-bold">{errors.agree.message}</span>}
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full mt-2">
              Send Verification OTP
            </Button>

            <p className="text-[11px] text-center text-gameGold font-bold mt-2 uppercase tracking-wide">
              🎁 Register now and get ₹{welcomeBonusAmount} Welcome Bonus.
            </p>

            <p className="text-xs text-center text-gray-500 font-bold mt-4 uppercase">
              Already a Member?{' '}
              <Link href="/login" className="text-gameAccent hover:underline">
                Log In Here
              </Link>
            </p>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-xl font-extrabold text-white mb-2 text-center">Verify OTP</h2>
          <p className="text-xs text-gray-400 font-semibold text-center mb-6 leading-relaxed">
            Enter the 6-digit OTP sent to <span className="text-white font-bold">{sessionStorage.getItem('reg_otp_provider') === 'email' || (settings.OTP_PROVIDER || '').toLowerCase() === 'email' ? sessionStorage.getItem('reg_email') : sessionStorage.getItem('reg_mobile')}</span>.
          </p>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                OTP Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 bg-gameCard/50 border border-white/5 rounded-lg text-sm text-white text-center font-bold tracking-widest placeholder-gray-500 focus:outline-none focus:border-gameAccent/50 transition-colors duration-200"
              />
              <div className="flex justify-between items-center text-xs mt-1">
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
              Verify & Complete Registration
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-center text-gray-500 font-bold hover:text-white transition-colors duration-200 uppercase tracking-wider py-1 focus:outline-none mt-2"
            >
              ← Edit Registration Details
            </button>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
