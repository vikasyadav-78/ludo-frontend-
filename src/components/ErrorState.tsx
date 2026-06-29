'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'An error occurred while loading data.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-500/10 bg-red-500/[0.02] rounded-xl my-4">
      <AlertCircle size={32} className="text-red-500 mb-3" />
      <h3 className="text-sm font-bold text-white mb-2">{message}</h3>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
