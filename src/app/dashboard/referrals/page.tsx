'use client';

import React, { useEffect, useState } from 'react';
import { Gift, Copy, Share2, Users, CheckCircle2, DollarSign, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import referralService, { ReferralDashboardStats } from '@/services/referral.service';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils';

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const { values: settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    const fetchReferralStats = async () => {
      try {
        const data = await referralService.getReferralDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to load referral stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReferralStats();
  }, []);

  const getInviteLink = () => {
    if (!stats?.referralCode) return '';
    return typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${stats.referralCode}`
      : '';
  };

  const handleCopyCode = async () => {
    if (!stats?.referralCode) return;
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyLink = async () => {
    const inviteLink = getInviteLink();
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleShare = async () => {
    const inviteLink = getInviteLink();
    if (!inviteLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BattleLudo!',
          text: `Register on BattleLudo using my referral code ${stats?.referralCode} and get ₹${welcomeBonusAmount} Welcome Bonus instantly!`,
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      handleCopyLink();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div>
          <div className="h-8 w-64 bg-white/5 rounded-lg mb-2" />
          <div className="h-4 w-96 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-80 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-80 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  const referralCode = stats?.referralCode || '';
  const inviteLink = getInviteLink();
  const welcomeBonusAmount = Number(settings.WELCOME_BONUS_AMOUNT || 0);
  const firstDepositReward = Number(settings.REFERRAL_FIRST_DEPOSIT_REWARD || 0);
  const referralCommission = Number(settings.REFERRAL_WINNING_COMMISSION_PERCENT || 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gift className="text-gameAccent" size={24} />
            <span>Referrals & Rewards</span>
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            Invite your allies to the arena and pocket continuous rewards
          </p>
        </div>
        <div className="bg-gameAccent/10 border border-gameAccent/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <Sparkles size={16} className="text-gameAccent animate-pulse" />
          <span className="text-xs font-bold text-gameAccent uppercase">
            Total Earnings: {formatCurrency(stats?.totalEarnings || 0)}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-2 relative overflow-hidden" glow>
          <div className="absolute top-0 right-0 p-4 opacity-5 text-green-500">
            <Users size={64} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invites</span>
          <span className="text-3xl font-black text-white">{stats?.totalReferrals || 0}</span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">Friends registered</span>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden" glow>
          <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-500">
            <CheckCircle2 size={64} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Friends</span>
          <span className="text-3xl font-black text-white">{stats?.activeReferrals || 0}</span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">Currently active in platform</span>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden" glow>
          <div className="absolute top-0 right-0 p-4 opacity-5 text-gameGold">
            <Wallet size={64} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deposit Rewards</span>
          <span className="text-3xl font-black text-gameGold">
            {formatCurrency(stats?.firstDepositRewards || 0)}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">First deposit bonuses</span>
        </Card>

        <Card className="flex flex-col gap-2 relative overflow-hidden" glow>
          <div className="absolute top-0 right-0 p-4 opacity-5 text-gamePurple">
            <DollarSign size={64} />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commissions</span>
          <span className="text-3xl font-black text-gamePurple">
            {formatCurrency(stats?.commissionEarnings || 0)}
          </span>
          <span className="text-[10px] text-gray-500 font-semibold uppercase">0.5% from friends winning battles</span>
        </Card>
      </div>

      {/* Main panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section: Invite & Code */}
        <Card className="lg:col-span-2 flex flex-col gap-6" hoverEffect={false}>
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Your Referral Credentials</h2>
            <p className="text-xs text-gray-500 mt-1">Copy your credentials or send a quick registration invite code link.</p>
          </div>

          {/* Large display code */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-xl gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Referral Code</span>
            <div className="text-4xl font-extrabold tracking-widest text-gameAccent font-mono bg-gameBg px-6 py-3 rounded-lg border border-gameAccent/20 shadow-[0_0_15px_rgba(0,229,255,0.1)] select-all uppercase">
              {referralCode}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyCode}
              className="mt-2 text-xs font-bold flex items-center gap-1.5"
            >
              <Copy size={14} />
              <span>{copiedCode ? 'Copied!' : 'Copy Referral Code'}</span>
            </Button>
          </div>

          {/* Invitation Link Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Referral Invitation Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="flex-1 bg-gameBg border border-white/5 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gameAccent transition-all select-all font-mono"
              />
              <Button
                variant="secondary"
                onClick={handleCopyLink}
                className="flex items-center justify-center px-3"
              >
                <Copy size={16} />
              </Button>
            </div>
            {copiedLink && (
              <span className="text-xs text-gameAccent font-bold mt-1 self-end">Invitation link copied!</span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mt-2">
            <Button
              variant="primary"
              onClick={handleShare}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2 font-bold uppercase tracking-wider"
            >
              <Share2 size={16} />
              <span>Share Invite Link</span>
            </Button>
          </div>
        </Card>

        {/* Right Section: Rules / Timeline */}
        <Card className="flex flex-col gap-6" hoverEffect={false}>
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider">How to Earn Bounties</h2>
            <p className="text-xs text-gray-500 mt-1">Four simple steps to start pocketing bonus money.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex gap-3 items-start">
              <div className="bg-gameAccent/10 text-gameAccent border border-gameAccent/20 rounded-lg p-2 font-black text-xs min-w-[32px] h-[32px] flex items-center justify-center">
                1
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Share Invitation</span>
                <p className="text-xs text-gray-400">Send your referral link or code to your friends and rivals.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-gameAccent/10 text-gameAccent border border-gameAccent/20 rounded-lg p-2 font-black text-xs min-w-[32px] h-[32px] flex items-center justify-center">
                2
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Ally Registers</span>
                <p className="text-xs text-gray-400">
                  They register using your code and instantly receive a <span className="text-gameAccent font-bold">₹{welcomeBonusAmount} Welcome Bonus</span> in their wallet.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-gameAccent/10 text-gameAccent border border-gameAccent/20 rounded-lg p-2 font-black text-xs min-w-[32px] h-[32px] flex items-center justify-center">
                3
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white uppercase tracking-wide">First Deposit Bonus</span>
                <p className="text-xs text-gray-400">
                  When your referred friend completes their first successful deposit request, you receive a massive <span className="text-gameGold font-bold">₹{firstDepositReward} Referral Reward</span>!
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="bg-gameAccent/10 text-gameAccent border border-gameAccent/20 rounded-lg p-2 font-black text-xs min-w-[32px] h-[32px] flex items-center justify-center">
                4
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white uppercase tracking-wide">Lifetime Commission</span>
                <p className="text-xs text-gray-400">
                  Whenever they win a battle in the arena, you receive a <span className="text-gamePurple font-bold">{referralCommission}% commission</span> straight to your Winning Balance!
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
