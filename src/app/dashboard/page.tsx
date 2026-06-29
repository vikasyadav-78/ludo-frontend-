'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Wallet, Plus, ArrowRight, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setOpenBattles, setBattlesLoading } from '@/features/battles/battlesSlice';
import battleService from '@/services/battle.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import SkeletonCardList from '@/components/SkeletonCardList';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { formatCurrency, cn } from '@/utils';

export default function UserDashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { depositBalance, winningBalance, bonusBalance } = useAppSelector((state) => state.wallet);
  const { openBattles, loading, error } = useAppSelector((state) => state.battles);

  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchOpenLobbies = async () => {
      dispatch(setBattlesLoading(true));
      try {
        const battles = await battleService.getOpenBattles();
        dispatch(setOpenBattles(battles));
      } catch (err: any) {
        // Ignored
      } finally {
        dispatch(setBattlesLoading(false));
      }
    };
    fetchOpenLobbies();
  }, [dispatch, refreshKey]);

  useEffect(() => {
    const fetchUserHistory = async () => {
      setHistoryLoading(true);
      try {
        const historyData = await battleService.getBattleHistory();
        setHistory(historyData);
      } catch {
        // Ignored
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchUserHistory();
  }, [refreshKey]);

  // Statistics calculations
  const totalMatches = history.filter((b) => b.status === 'COMPLETED').length;
  const totalWins = history.filter((b) => b.status === 'COMPLETED' && b.winner === user?.id).length;
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0;

  const totalEarnings = history
    .filter((b) => b.status === 'COMPLETED' && b.winner === user?.id)
    .reduce((sum, b) => sum + b.winnerAmount, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header & stats grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Arena <span className="text-gameAccent">Dashboard</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
            Challenger: <span className="text-gamePurple">{user?.name}</span> | Level: Gold
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/battles/create">
            <Button variant="primary" className="flex items-center gap-2 font-bold uppercase text-xs">
              <Plus size={16} />
              <span>Create Challenge</span>
            </Button>
          </Link>
          <Link href="/dashboard/battles">
            <Button variant="secondary" className="flex items-center gap-2 font-bold uppercase text-xs">
              <Gamepad2 size={16} />
              <span>Browse Arena</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Balance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center justify-between" glow>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Winnings Balance</span>
            <span className="text-2xl font-black text-white">{formatCurrency(winningBalance)}</span>
          </div>
          <div className="p-3 bg-gameAccent/10 rounded-xl text-gameAccent">
            <Wallet size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deposits Balance</span>
            <span className="text-2xl font-black text-white">{formatCurrency(depositBalance)}</span>
          </div>
          <div className="p-3 bg-gamePurple/10 rounded-xl text-gamePurple">
            <Wallet size={20} />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bonus Balance</span>
            <span className="text-2xl font-black text-white">{formatCurrency(bonusBalance)}</span>
          </div>
          <div className="p-3 bg-gameGold/10 rounded-xl text-gameGold">
            <Wallet size={20} />
          </div>
        </Card>
      </div>


      {/* Battle Performance Statistics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 bg-gradient-to-br from-gamePurple/5 to-transparent">
          <div className="p-3 bg-gamePurple/10 rounded-xl text-gamePurple">
            <TrendingUp size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Win Rate</span>
            <span className="text-xl font-black text-white glow-purple">{winRate}%</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-gameAccent/5 to-transparent">
          <div className="p-3 bg-gameAccent/10 rounded-xl text-gameAccent">
            <Trophy size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Earnings</span>
            <span className="text-xl font-black text-white glow-accent">{formatCurrency(totalEarnings)}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-gradient-to-br from-gameGold/5 to-transparent">
          <div className="p-3 bg-gameGold/10 rounded-xl text-gameGold">
            <Sparkles size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Matches Played</span>
            <span className="text-xl font-black text-white">{totalMatches} battles</span>
          </div>
        </Card>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Open Lobby Battles List (Takes 2 columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 size={18} className="text-gameAccent" />
              <span>Open Challenges</span>
            </h2>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="text-xs font-bold text-gameAccent hover:underline"
            >
              Refresh Lobby
            </button>
          </div>

          {loading ? (
            <SkeletonCardList />
          ) : error ? (
            <ErrorState message={error} />
          ) : openBattles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openBattles.map((battle) => (
                <Card key={battle.id} className="flex flex-col justify-between gap-4">
                  <div className="flex items-start justify-between border-b border-white/5 pb-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-wide">{battle.title}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">
                        By {battle.createdBy?.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-gameAccent bg-gameAccent/10 px-2.5 py-1 rounded-full">
                      Entry Fee: {formatCurrency(battle.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                    <span>Winner payout: {formatCurrency(battle.winnerAmount)}</span>
                    <span>Fee: {battle.commission}%</span>
                  </div>

                  <Link href={`/dashboard/battles/${battle.id}`} className="mt-2">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2 text-xs">
                      <span>View Match</span>
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Active Open Lobbies"
              description="Be the first to challenge the arena! Create a battle now."
            />
          )}
        </div>

        {/* Sidebar panels (rules / banner mockup / instructions) */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Arena Guidelines
            </h3>
            <ul className="text-xs text-gray-400 font-medium flex flex-col gap-2.5 list-disc list-inside">
              <li>Ludo match must be played using standard application layouts.</li>
              <li>Always record a screen recording or screenshot of the end game results.</li>
              <li>Submit results within 15 minutes of match completion.</li>
              <li>Fake screenshots will lead to permanent account suspension.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
