'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/features/auth/authSlice';
import {
  Gamepad2,
  Wallet,
  User,
  LogOut,
  Trophy,
  HelpCircle,
  Bell,
  LayoutDashboard,
  Gift,
} from 'lucide-react';
import { cn } from '@/utils';

interface SidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export default function Sidebar({ className, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Battles', path: '/dashboard/battles', icon: Gamepad2 },
    { label: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
    { label: 'Referrals', path: '/dashboard/referrals', icon: Gift },
    { label: 'Leaderboard', path: '/dashboard/leaderboard', icon: Trophy },
    { label: 'Support', path: '/dashboard/support', icon: HelpCircle },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'Profile', path: '/dashboard/profile', icon: User },
  ];

  const handleLogout = () => {
    // Clear cookies & trigger state logout
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    dispatch(logout());
  };

  return (
    <aside className={cn('w-64 h-full bg-gameCard border-r border-white/5 flex flex-col justify-between p-4', className)}>
      <div className="flex flex-col gap-6">
        {/* Brand header */}
        <div className="flex items-center gap-2 px-2">
          <Gamepad2 size={24} className="text-gameAccent" />
          <span className="text-lg font-black uppercase tracking-wider text-white">
            BATTLE<span className="text-gameAccent">LUDO</span>
          </span>
        </div>

        {/* Menu items */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onCloseMobile}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-gamePurple/20 to-gameAccent/10 text-gameAccent border-l-2 border-gameAccent'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg text-sm font-semibold transition-all duration-200"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
