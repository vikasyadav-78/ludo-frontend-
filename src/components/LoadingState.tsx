'use client';

import React from 'react';

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-gameAccent rounded-full animate-spin" />
      </div>
      <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase mt-4">
        Loading Data...
      </p>
    </div>
  );
}
