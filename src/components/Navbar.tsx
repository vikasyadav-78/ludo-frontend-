'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Wallet, Bell, User, Eye, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setNotifications, markRead, markAllRead } from '@/features/notifications/notificationsSlice';
import notificationService from '@/services/notification.service';
import { formatCurrency, formatDate, cn } from '@/utils';
import DefaultAvatar from '@/components/DefaultAvatar';

interface NavbarProps {
  onMenuTrigger: () => void;
}

export default function Navbar({ onMenuTrigger }: NavbarProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { depositBalance, winningBalance } = useAppSelector((state) => state.wallet);
  const { notifications } = useAppSelector((state) => state.notifications);

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        dispatch(setNotifications(data));
      } catch (err) {
        // Ignore
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [dispatch, user]);

  const totalBalance = depositBalance + winningBalance;
  const unreadCount = notifications.filter((n) => !n.readStatus).length;

  const handleReadNotification = async (id: string) => {
    try {
      await notificationService.markRead(id);
      dispatch(markRead(id));
    } catch {
      // Ignored
    }
  };

  const handleReadAll = async () => {
    try {
      await notificationService.markAllRead();
      dispatch(markAllRead());
    } catch {
      // Ignored
    }
  };

  return (
    <header className="h-16 border-b border-white/5 bg-gameCard/40 backdrop-blur-md px-6 flex items-center justify-between relative z-30">
      {/* Mobile Menu trigger */}
      <button
        onClick={onMenuTrigger}
        className="lg:hidden text-gray-400 hover:text-white transition-colors duration-200"
      >
        <Menu size={20} />
      </button>

      {/* Brand logo spacer / Title on desktop */}
      <h2 className="hidden lg:block text-sm font-bold tracking-widest text-gray-400 uppercase">
        Arena Lobby
      </h2>

      {/* Right nav utilities */}
      <div className="flex items-center gap-4">
        {/* Wallet Balance widget */}
        <Link
          href="/dashboard/wallet"
          className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg text-xs font-bold text-gameAccent hover:bg-white/[0.05] transition-all duration-200"
        >
          <Wallet size={14} />
          <span>{formatCurrency(totalBalance)}</span>
        </Link>

        {/* Notification Bell trigger with Badge */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-gray-400 hover:text-white bg-white/[0.02] rounded-lg transition-colors duration-200 relative"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl border border-white/5 shadow-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-black uppercase text-white tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleReadAll}
                    className="text-[9px] font-bold text-gameAccent hover:underline flex items-center gap-0.5"
                  >
                    <Check size={10} />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notif) => {
                    const parts = notif.body.split('|battleId:');
                    const displayBody = parts[0];
                    const battleId = parts[1];

                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-2.5 rounded-lg border border-white/5 flex items-start justify-between gap-2 text-xs font-semibold',
                          !notif.readStatus ? 'bg-gameAccent/5 border-gameAccent/10' : 'bg-white/[0.01]'
                        )}
                      >
                        <div className="flex flex-col gap-0.5 max-w-[85%]">
                          <span className="text-white font-bold">{notif.title}</span>
                          <span className="text-gray-400 text-[10px] leading-relaxed">{displayBody}</span>
                          {battleId && (
                            <Link
                              href={`/dashboard/battles/${battleId}`}
                              onClick={() => setIsNotifOpen(false)}
                              className="text-[9px] text-gameAccent font-bold mt-1 hover:underline flex items-center gap-0.5"
                            >
                              <span>Open Battle Room</span>
                            </Link>
                          )}
                        </div>
                        {!notif.readStatus && (
                          <button
                            onClick={() => handleReadNotification(notif.id)}
                            className="text-gray-500 hover:text-gameAccent transition-colors duration-150"
                          >
                            <Eye size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-[10px] text-gray-500 py-6">All caught up!</div>
                )}
              </div>
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsNotifOpen(false)}
                className="text-center text-[10px] font-bold text-gameAccent hover:underline border-t border-white/5 pt-2"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        {/* User profile dropdown avatar link */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 border-l border-white/5 pl-4"
        >
          <div className="w-8 h-8 rounded-full bg-gamePurple flex items-center justify-center text-white text-xs font-bold overflow-hidden border border-white/10">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <DefaultAvatar />
            )}
          </div>
          <span className="hidden sm:block text-xs font-bold text-gray-300">
            {user?.name}
          </span>
        </Link>
      </div>
    </header>
  );
}
