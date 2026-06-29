'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import Drawer from '@/components/Drawer';
import useOnlineStatus from '@/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gameBg">
      {/* Desktop Sidebar (visible on lg screen) */}
      <Sidebar className="hidden lg:flex" />

      {/* Mobile Sidebar inside Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="BattleLudo Navigation"
        position="right"
        className="p-0 bg-gameBg"
      >
        <Sidebar className="w-full border-none p-0" onCloseMobile={() => setIsMobileMenuOpen(false)} />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-pulse z-40">
            <WifiOff size={14} />
            <span>You are currently offline. Please check your internet connection.</span>
          </div>
        )}

        {/* Navbar */}
        <Navbar onMenuTrigger={() => setIsMobileMenuOpen(true)} />

        {/* Scrollable page container */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
