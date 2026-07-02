'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Gift, Award, Star } from 'lucide-react';
import Card from '@/components/Card';
import Table from '@/components/Table';
import { formatCurrency } from '@/utils';
import profileService from '@/services/profile.service';
import DefaultAvatar from '@/components/DefaultAvatar';

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar?: string;
  winnings: number;
  wins: number;
}

interface ReferrerUser {
  rank: number;
  name: string;
  avatar?: string;
  referralsCount: number;
  bonusEarned: number;
}

export default function LeaderboardPage() {
  const [topWinners, setTopWinners] = useState<LeaderboardUser[]>([]);
  const [topReferrers, setTopReferrers] = useState<ReferrerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await profileService.getLeaderboard();
        setTopWinners(data.topWinners);
        setTopReferrers(data.topReferrers);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load leaderboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Platform Hall of Fame
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            Celebrating top winning champions and referral leaders in the arena
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gameAccent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Platform Hall of Fame
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            Celebrating top winning champions and referral leaders in the arena
          </p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-center font-bold text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">
          Platform Hall of Fame
        </h1>
        <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
          Celebrating top winning champions and referral leaders in the arena
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Winners list */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy size={18} className="text-gameGold" />
            <span>Top Winning Champions</span>
          </h2>
          <Card className="p-0">
            <Table
              data={topWinners}
              columns={[
                { header: 'Rank', accessor: (row) => (
                  <span className="flex items-center gap-1">
                    {row.rank === 1 && <Award size={14} className="text-gameGold" />}
                    {row.rank === 2 && <Award size={14} className="text-gray-400" />}
                    {row.rank === 3 && <Award size={14} className="text-amber-700" />}
                    <span className="font-bold">{row.rank}</span>
                  </span>
                )},
                { header: 'Champion Name', accessor: (row) => (
                  <div className="flex items-center gap-2 select-none">
                    {row.avatar ? (
                      <img src={row.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-white/10">
                        <DefaultAvatar />
                      </div>
                    )}
                    <span>{row.name}</span>
                  </div>
                )},
                { header: 'Total Winnings', accessor: (row) => formatCurrency(row.winnings) },
                { header: 'Match Wins', accessor: (row) => `${row.wins} wins` },
              ]}
              emptyMessage="No champions declared. Play battle matches to rank on the winning leaderboard."
            />
          </Card>
        </div>

        {/* Top Referrers list */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gift size={18} className="text-gameAccent" />
            <span>Top Referral Leaders</span>
          </h2>
          <Card className="p-0">
            <Table
              data={topReferrers}
              columns={[
                { header: 'Rank', accessor: 'rank' },
                { header: 'Inviter Name', accessor: (row) => (
                  <div className="flex items-center gap-2 select-none">
                    {row.avatar ? (
                      <img src={row.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center border border-white/10">
                        <DefaultAvatar />
                      </div>
                    )}
                    <span>{row.name}</span>
                  </div>
                )},
                { header: 'Referred Users', accessor: (row) => `${row.referralsCount} users` },
                { header: 'Bonus Balance Earned', accessor: (row) => formatCurrency(row.bonusEarned) },
              ]}
              emptyMessage="No active inviters. Invite friends using referral codes to top the leaderboard."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
