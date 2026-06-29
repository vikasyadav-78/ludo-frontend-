'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Plus, Sparkles, History, Radio } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setOpenBattles,
  setActiveBattles,
  setCompletedBattles,
  setBattlesLoading,
} from '@/features/battles/battlesSlice';
import battleService from '@/services/battle.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SkeletonCardList from '@/components/SkeletonCardList';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, cn } from '@/utils';

type TabType = 'open' | 'active' | 'completed';

export default function BrowseBattlesPage() {
  const dispatch = useAppDispatch();
  const { openBattles, activeBattles, completedBattles, loading } = useAppSelector(
    (state) => state.battles
  );

  const [activeTab, setActiveTab] = useState<TabType>('open');

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setBattlesLoading(true));
      try {
        if (activeTab === 'open') {
          const res = await battleService.getOpenBattles();
          dispatch(setOpenBattles(res));
        } else if (activeTab === 'active') {
          const res = await battleService.getActiveBattles();
          dispatch(setActiveBattles(res));
        } else {
          const res = await battleService.getCompletedBattles();
          dispatch(setCompletedBattles(res));
        }
      } catch (err) {
        // Handle error
      } finally {
        dispatch(setBattlesLoading(false));
      }
    };
    fetchData();
  }, [activeTab, dispatch]);

  const renderBattleList = (battles: any[]) => {
    if (battles.length === 0) {
      return (
        <EmptyState
          title={`No ${activeTab} battles found`}
          description="Lobbies will appear here as soon as matches are created or started."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {battles.map((battle) => (
          <Card key={battle.id} className="flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between border-b border-white/5 pb-3">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white tracking-wide">{battle.title}</span>
                <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                  Host: {battle.createdBy?.name}
                </span>
              </div>
              <span className="text-xs font-black text-gameAccent bg-gameAccent/10 px-2.5 py-1 rounded-full">
                {formatCurrency(battle.amount)}
              </span>
            </div>

            <div className="flex flex-col gap-1 text-xs text-gray-400 font-semibold">
              <div className="flex items-center justify-between">
                <span>Payout:</span>
                <span className="text-white">{formatCurrency(battle.winnerAmount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                  battle.status === 'IN_PROGRESS' && 'bg-gamePurple/20 text-gamePurple',
                  battle.status === 'COMPLETED' && 'bg-green-500/20 text-green-400',
                  battle.status === 'DISPUTED' && 'bg-red-500/20 text-red-400',
                  battle.status === 'OPEN' && 'bg-gameAccent/20 text-gameAccent'
                )}>
                  {battle.status}
                </span>
              </div>
            </div>

            <Link href={`/dashboard/battles/${battle.id}`} className="mt-2">
              <Button variant="secondary" className="w-full text-xs font-bold uppercase">
                View Arena Details
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Gaming Arena Lobbies
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            Challenge players, wage battles, and claim rewards
          </p>
        </div>

        <Link href="/dashboard/battles/create">
          <Button variant="primary" className="flex items-center gap-2 text-xs font-black uppercase tracking-wide">
            <Plus size={16} />
            <span>Create New Challenge</span>
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 bg-gameCard/20 p-1 rounded-lg self-start">
        <button
          onClick={() => setActiveTab('open')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'open' ? 'bg-gameCard text-gameAccent shadow-md' : 'text-gray-400 hover:text-white'
          )}
        >
          <Radio size={14} />
          <span>Open Lobby</span>
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'active' ? 'bg-gameCard text-gamePurple shadow-md' : 'text-gray-400 hover:text-white'
          )}
        >
          <Sparkles size={14} />
          <span>In Progress</span>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-200',
            activeTab === 'completed' ? 'bg-gameCard text-gameGold shadow-md' : 'text-gray-400 hover:text-white'
          )}
        >
          <History size={14} />
          <span>Completed</span>
        </button>
      </div>

      {/* Battle Grid Lists */}
      {loading ? <SkeletonCardList /> : renderBattleList(
        activeTab === 'open' ? openBattles : activeTab === 'active' ? activeBattles : completedBattles
      )}
    </div>
  );
}
