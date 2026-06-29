'use client';

import React from 'react';
import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export default function Skeleton({ className, count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('animate-pulse bg-white/[0.04] rounded-lg w-full h-8', className)}
        />
      ))}
    </>
  );
}
