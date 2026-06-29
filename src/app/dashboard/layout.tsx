'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setWalletBalances } from '@/features/wallet/walletSlice';
import { setCredentials, logout } from '@/features/auth/authSlice';
import walletService from '@/services/wallet.service';
import profileService from '@/services/profile.service';
import DashboardLayout from '@/layouts/DashboardLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync wallet balances and verify credentials on layout mount
  useEffect(() => {
    if (!mounted) return;

    const token = getCookie('token');

    if (!token) {
      dispatch(logout());
      router.push('/login');
      return;
    }

    const fetchBalancesAndProfile = async () => {
      try {
        // If Redux is not authenticated but we have a token cookie, fetch profile to authenticate Redux
        if (!isAuthenticated) {
          const user = await profileService.getProfile();
          dispatch(setCredentials({ user, token }));
        }

        const balances = await walletService.getBalance();
        dispatch(setWalletBalances(balances));
      } catch (err) {
        // Token is invalid, expired, or backend database was reset.
        // Clear cookie and log out.
        dispatch(logout());
        router.push('/login');
      }
    };

    fetchBalancesAndProfile();
  }, [isAuthenticated, router, dispatch, mounted]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gameBg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-gameAccent border-white/5" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <DashboardLayout>{children}</DashboardLayout>;
}
