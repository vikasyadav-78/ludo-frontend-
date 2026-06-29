'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Plus, Ticket, MessageSquare } from 'lucide-react';
import supportService from '@/services/support.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Table from '@/components/Table';
import LoadingState from '@/components/LoadingState';
import { formatDate, cn } from '@/utils';

export default function SupportTicketsHistoryPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await supportService.getMyTickets();
        setTickets(data);
      } catch (err) {
        // Silently capture error
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Help & Support Desk
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            File support tickets for wager concerns or dispute conflicts
          </p>
        </div>

        <Link href="/dashboard/support/create">
          <Button variant="primary" className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
            <Plus size={16} />
            <span>Create Support Ticket</span>
          </Button>
        </Link>
      </div>

      {/* Ticket Logs Table */}
      {loading ? (
        <LoadingState />
      ) : (
        <Card className="p-0">
          <Table
            data={tickets}
            columns={[
              { header: 'Ticket ID', accessor: (row) => row.id ? `#${row.id.length > 8 ? row.id.substring(row.id.length - 8) : row.id}` : '#' },
              { header: 'Title', accessor: 'title' },
              { header: 'Category', accessor: 'category' },
              { header: 'Priority', accessor: (row) => (
                <span className={cn(
                  'text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase',
                  row.priority === 'HIGH' && 'bg-red-500/20 text-red-400',
                  row.priority === 'MEDIUM' && 'bg-gameGold/20 text-gameGold',
                  row.priority === 'LOW' && 'bg-gameAccent/20 text-gameAccent'
                )}>
                  {row.priority}
                </span>
              ) },
              { header: 'Status', accessor: (row) => (
                <span className={cn(
                  'text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase',
                  row.status === 'CLOSED' && 'bg-gray-500/20 text-gray-400',
                  row.status === 'IN_PROGRESS' && 'bg-gamePurple/20 text-gamePurple',
                  row.status === 'OPEN' && 'bg-gameAccent/20 text-gameAccent'
                )}>
                  {row.status}
                </span>
              ) },
              { header: 'Last Updated', accessor: (row) => formatDate(row.updatedAt) },
              { header: 'Action', accessor: (row) => (
                <Link href={`/dashboard/support/${row.id}`}>
                  <Button variant="secondary" size="sm" className="flex items-center gap-1 text-[10px] uppercase font-bold py-1">
                    <MessageSquare size={12} />
                    <span>View Thread</span>
                  </Button>
                </Link>
              ) },
            ]}
            emptyMessage="You haven't filed any support tickets yet."
          />
        </Card>
      )}
    </div>
  );
}
