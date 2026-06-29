'use client';

import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-gameBg px-4 py-12 relative overflow-hidden">
      {/* Decorative colored glow overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gamePurple/10 rounded-full filter blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gameAccent/10 rounded-full filter blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand logo details */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="p-3 bg-gradient-to-br from-gamePurple to-gameAccent rounded-2xl shadow-lg border border-white/10">
            <Gamepad2 size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white">
            BATTLE<span className="text-gameAccent">LUDO</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            Enter the Battle Arena
          </p>
        </div>

        {/* Card content wrapper */}
        <div className="glass-panel-glow rounded-xl p-8 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
