'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, ShieldCheck, Zap, Award } from 'lucide-react';
import PublicLayout from '@/layouts/PublicLayout';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function LandingPage() {
  return (
    <PublicLayout>
      <div className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-gameAccent/5 rounded-full filter blur-[150px]" />

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center flex flex-col items-center gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-full text-xs font-bold text-gameAccent uppercase tracking-widest">
            <Zap size={12} />
            <span>Real-time Gaming Arena</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-wider text-white max-w-3xl leading-tight">
            THE ULTIMATE <span className="text-gameAccent glow-accent">LUDO BATTLE</span> PLATFORM
          </h1>

          <p className="text-gray-400 max-w-xl text-sm sm:text-base font-semibold leading-relaxed">
            Create battles, challenge opponents in real-time, submit screenshots, and secure payouts instantly with audited ledgers.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="px-8 font-black uppercase tracking-wider">
                Start Battle
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="px-8 font-black uppercase tracking-wider">
                View Arena
              </Button>
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section className="max-w-7xl mx-auto px-6 py-16 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-gameAccent/10 border border-gameAccent/20 flex items-center justify-center text-gameAccent">
              <Zap size={20} />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">Instant Matchmaking</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Create a battle and share invite codes, or instantly challenge other active battle lobbies in the arena.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-gamePurple/10 border border-gamePurple/20 flex items-center justify-center text-gamePurple">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">Secure Wallet Ledgers</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Dual-entry ledger system ensures deposit, winning, and bonus sub-balances are tracked without disputes.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-gameGold/10 border border-gameGold/20 flex items-center justify-center text-gameGold">
              <Award size={20} />
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">Conflict-free Resolving</h3>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Report win/loss screenshot outcomes. Auto dispute logic routes conflicts to support admins for resolution.
            </p>
          </Card>
        </section>
      </div>
    </PublicLayout>
  );
}
