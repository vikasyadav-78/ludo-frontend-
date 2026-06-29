'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import LoadingState from '@/components/LoadingState';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: Array<'USER' | 'ADMIN' | 'SUPPORT'>;
}

export default function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(`/login?redirect=${pathname}`);
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, loading, router, pathname, allowedRoles]);

  if (loading || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen w-screen bg-gameBg flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  return <>{children}</>;
}
