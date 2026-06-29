'use client';

import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { cn } from '@/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no items to display at the moment.',
  icon = <ShieldAlert size={36} className="text-gray-500" />,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/5 bg-gameCard/10 rounded-xl my-4', className)}>
      <div className="p-3 bg-white/[0.02] rounded-full mb-3">{icon}</div>
      <h3 className="text-base font-bold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
