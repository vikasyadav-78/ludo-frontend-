'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import Button from '@/components/Button';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gameBg text-gray-200">
      {/* Header navbar */}
      <header className="h-16 border-b border-white/5 bg-gameCard/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <Gamepad2 size={24} className="text-gameAccent" />
          <span className="text-lg font-black uppercase tracking-wider text-white">
            BATTLE<span className="text-gameAccent">LUDO</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gameCard/20 py-8 px-6 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} BattleLudo Platform. All rights reserved.
      </footer>
    </div>
  );
}
