'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setNotifications,
  markRead,
  markAllRead,
  setNotificationsLoading,
  setNotificationsError,
} from '@/features/notifications/notificationsSlice';
import notificationService from '@/services/notification.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import { formatDate, cn } from '@/utils';

export default function NotificationsFeedPage() {
  const dispatch = useAppDispatch();
  const { notifications, loading } = useAppSelector((state) => state.notifications);

  const fetchNotifs = async () => {
    dispatch(setNotificationsLoading(true));
    try {
      const data = await notificationService.getNotifications();
      dispatch(setNotifications(data));
    } catch (err: any) {
      dispatch(setNotificationsError(err.message || 'Failed to load notifications'));
    } finally {
      dispatch(setNotificationsLoading(false));
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [dispatch]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      dispatch(markRead(id));
      toast.success('Marked as read.');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      dispatch(markAllRead());
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to update status.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Notifications Center
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            System logs, wallet approvals, and matchmaking feeds
          </p>
        </div>

        {notifications.length > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs font-bold uppercase py-2">
            <Check size={14} />
            <span>Mark All As Read</span>
          </Button>
        )}
      </div>

      {/* Notifications list feed */}
      {loading ? (
        <LoadingState />
      ) : notifications.length > 0 ? (
        <div className="flex flex-col gap-4">
          {notifications.map((notif) => {
            const parts = notif.body.split('|battleId:');
            const displayBody = parts[0];
            const battleId = parts[1];

            return (
              <Card
                key={notif.id}
                className={cn(
                  'flex items-start justify-between gap-4 transition-all duration-200',
                  !notif.readStatus
                    ? 'border-gameAccent/20 bg-gameCard/80 shadow-[0_0_10px_rgba(0,229,255,0.02)]'
                    : 'bg-gameCard/40'
                )}
              >
                <div className="flex gap-3">
                  <div className={cn(
                    'p-2 rounded-lg mt-0.5',
                    notif.type === 'BATTLE' && 'bg-gamePurple/10 text-gamePurple',
                    notif.type === 'WALLET' && 'bg-gameAccent/10 text-gameAccent',
                    notif.type === 'SYSTEM' && 'bg-gameGold/10 text-gameGold'
                  )}>
                    <Bell size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-black text-white tracking-wide">{notif.title}</h4>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{displayBody}</p>
                    {battleId && (
                      <Link
                        href={`/dashboard/battles/${battleId}`}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs text-gameAccent font-bold hover:underline"
                      >
                        <span>Open Battle Room</span>
                      </Link>
                    )}
                    <span className="text-[9px] text-gray-600 font-bold uppercase mt-1">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                </div>

                {!notif.readStatus && (
                  <button
                    onClick={() => handleMarkRead(notif.id)}
                    className="text-xs text-gray-500 hover:text-gameAccent transition-colors duration-150 p-2 shrink-0"
                  >
                    <Eye size={16} />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="All Caught Up!" description="No notifications found in your feed center." />
      )}
    </div>
  );
}
