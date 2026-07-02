'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Share2, Award, Upload, ShieldCheck, Trophy, AlertTriangle, HelpCircle, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/store/hooks';
import battleService from '@/services/battle.service';
import uploadService from '@/services/upload.service';
import useSocket from '@/hooks/useSocket';
import Card from '@/components/Card';
import Button from '@/components/Button';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import Select from '@/components/Select';
import Modal from '@/components/Modal';
import { formatCurrency, cn } from '@/utils';


export default function BattleRoomPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  const [battle, setBattle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reportingStatus, setReportingStatus] = useState<'WIN' | 'LOSS' | 'CANCEL'>('WIN');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submittingResult, setSubmittingResult] = useState(false);
  const [isLudoKingModalOpen, setIsLudoKingModalOpen] = useState(false);
  const [newInviteCode, setNewInviteCode] = useState('');
  const [settingInviteCode, setSettingInviteCode] = useState(false);

  const handleOpenLudoKing = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = 'ludoking://';
      setTimeout(() => {
        setIsLudoKingModalOpen(true);
      }, 1500);
    } else {
      setIsLudoKingModalOpen(true);
    }
  };


  // Socket.io integration
  const { on } = useSocket(id);

  const fetchDetails = async () => {
    try {
      const data = await battleService.getBattleDetails(id);
      setBattle(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load battle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();

    // Listen to real-time status updates from Socket.io server
    const cleanupJoin = on('battle_joined', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.success('An opponent joined the battle room!');
    });

    const cleanupCancel = on('battle_cancelled', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.error('The battle lobby was cancelled.');
      router.push('/dashboard/battles');
    });

    const cleanupComplete = on('battle_completed', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.success('Battle outcome declared! Payout settled.');
    });

    const cleanupDispute = on('battle_disputed', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.error('Lobby disputed! Conflicting results reported.');
    });

    const cleanupSubmitted = on('result_submitted', () => {
      fetchDetails();
      toast('Player submitted result proof!');
    });

    const cleanupSettled = on('battle_settled', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.success('Battle verified and settled successfully!');
    });

    const cleanupRefunded = on('battle_refunded', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.success('Battle cancelled and refunded by admin.');
    });

    const cleanupInviteSet = on('battle_invite_code_updated', (updatedBattle: any) => {
      setBattle(updatedBattle);
      toast.success('Ludo King room invite code is set!');
    });

    return () => {
      cleanupJoin();
      cleanupCancel();
      cleanupComplete();
      cleanupDispute();
      cleanupSubmitted();
      cleanupSettled();
      cleanupRefunded();
      cleanupInviteSet();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleJoin = async () => {
    try {
      const updated = await battleService.joinBattle(id);
      setBattle(updated);
      toast.success('Joined battle room successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to join match.');
    }
  };

  const handleCancel = async () => {
    try {
      await battleService.cancelBattle(id);
      toast.success('Lobby cancelled. Funds refunded.');
      router.push('/dashboard/battles');
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel lobby.');
    }
  };

  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInviteCode || newInviteCode.trim() === '') {
      toast.error('Invite code cannot be empty.');
      return;
    }
    if (!/^\d{8}$/.test(newInviteCode.trim())) {
      toast.error('Invite code must be exactly 8 digits.');
      return;
    }
    setSettingInviteCode(true);
    try {
      const updated = await battleService.setInviteCode(id, newInviteCode);
      setBattle(updated);
      toast.success('Invite code set successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to set invite code.');
    } finally {
      setSettingInviteCode(false);
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportingStatus !== 'CANCEL' && !screenshotFile) {
      toast.error('Screenshot proof is required for Win/Loss outcomes.');
      return;
    }

    setSubmittingResult(true);
    try {
      if (screenshotFile) {
        await uploadService.uploadBattleScreenshot(id, reportingStatus, screenshotFile);
      } else {
        const formData = new FormData();
        formData.append('battleId', id);
        formData.append('status', reportingStatus);
        await battleService.submitResult(formData);
      }

      toast.success('Outcome reported successfully!');
      fetchDetails(); // Reload page
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit match outcome.');
    } finally {
      setSubmittingResult(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (battle?.inviteCode) {
      navigator.clipboard.writeText(battle.inviteCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={fetchDetails} />;
  if (!battle) return <ErrorState message="Battle not found." />;

  const isCreator = battle.createdBy?.id === user?.id;
  const isJoiner = battle.joinedBy?.id === user?.id;
  const isParticipant = isCreator || isJoiner;

  const bothSubmitted = battle.participants?.length === 2 && battle.participants.every((p: any) => p.submittedResult !== null);

  // Timeline Tracker Steps mapping
  const timelineSteps = [
    { label: 'LOBBY OPEN', active: ['OPEN', 'JOINED', 'IN_PROGRESS', 'RESULT_SUBMITTED', 'PENDING_APPROVAL', 'COMPLETED', 'SETTLED', 'DISPUTED'].includes(battle.status) },
    { label: 'MATCH STARTED', active: ['JOINED', 'IN_PROGRESS', 'RESULT_SUBMITTED', 'PENDING_APPROVAL', 'COMPLETED', 'SETTLED', 'DISPUTED'].includes(battle.status) },
    { label: 'REPORTING', active: ['RESULT_SUBMITTED', 'PENDING_APPROVAL', 'COMPLETED', 'SETTLED', 'DISPUTED'].includes(battle.status) },
    { label: 'SETTLED', active: ['COMPLETED', 'SETTLED'].includes(battle.status) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/battles"
          className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            Battle Arena Room
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {battle.title}
          </p>
        </div>
      </div>

      {/* Battle Status Timeline Tracker */}
      <div className="grid grid-cols-4 gap-2 bg-gameCard/40 border border-white/5 rounded-xl p-4 text-center">
        {timelineSteps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1.5 relative">
            <div className={cn(
              'h-2.5 w-2.5 rounded-full z-10 transition-all duration-300',
              step.active ? 'bg-gameAccent shadow-[0_0_10px_rgba(0,229,255,0.8)]' : 'bg-white/10'
            )} />
            <span className={cn(
              'text-[8px] font-black uppercase tracking-wider',
              step.active ? 'text-gameAccent glow-accent' : 'text-gray-500'
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core details & wagers */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Main Info Card */}
          <Card className="flex flex-col gap-6" glow={battle.status === 'IN_PROGRESS'}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entry Wage</span>
                <span className="text-2xl font-black text-white">{formatCurrency(battle.amount)}</span>
              </div>
              <div className="flex flex-col gap-1 sm:text-right">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</span>
                <span className={cn(
                  'text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full w-fit sm:ml-auto',
                  battle.status === 'OPEN' && 'bg-gameAccent/10 text-gameAccent border border-gameAccent/20',
                  battle.status === 'IN_PROGRESS' && 'bg-gamePurple/10 text-gamePurple border border-gamePurple/20',
                  battle.status === 'RESULT_SUBMITTED' && (bothSubmitted ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'),
                  battle.status === 'PENDING_APPROVAL' && 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                  (battle.status === 'COMPLETED' || battle.status === 'SETTLED') && 'bg-green-500/10 text-green-400 border border-green-500/20',
                  battle.status === 'DISPUTED' && 'bg-red-500/10 text-red-400 border border-red-500/20'
                )}>
                  {battle.status === 'RESULT_SUBMITTED' && bothSubmitted ? 'AI VERIFYING...' : battle.status}
                </span>
              </div>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
              <div className="flex items-center gap-3 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                <div className="w-10 h-10 rounded-full bg-gamePurple flex items-center justify-center text-white text-sm font-bold">
                  {battle.createdBy?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{battle.createdBy?.name}</span>
                  <span className="text-[9px] font-bold uppercase text-gamePurple tracking-wider">Creator (Host)</span>
                </div>
              </div>

              {battle.joinedBy ? (
                <div className="flex items-center gap-3 bg-white/[0.01] p-4 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gameAccent flex items-center justify-center text-gameBg text-sm font-bold">
                    {battle.joinedBy?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white">{battle.joinedBy?.name}</span>
                    <span className="text-[9px] font-bold uppercase text-gameAccent tracking-wider">Joiner (Challenger)</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-white/10 rounded-xl p-4 text-center">
                  <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                    Waiting for opponent...
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Result Reporter Form */}
          {battle.status === 'IN_PROGRESS' && isParticipant && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Report Game Result
              </h3>
              <form onSubmit={handleResultSubmit} className="flex flex-col gap-4">
                <Select
                  label="Match Outcome"
                  value={reportingStatus}
                  onChange={(e) => setReportingStatus(e.target.value as any)}
                  options={[
                    { label: 'Declared Victory (Win)', value: 'WIN' },
                    { label: 'Acknowledge Loss', value: 'LOSS' },
                    { label: 'Request Cancellation (Agreement)', value: 'CANCEL' },
                  ]}
                />

                {reportingStatus !== 'CANCEL' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
                      Screenshot Proof
                    </label>
                    <div className="flex items-center justify-center border border-dashed border-white/10 rounded-lg p-6 bg-white/[0.01] relative cursor-pointer hover:bg-white/[0.02]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-1.5 text-center text-xs text-gray-500 font-semibold">
                        <Upload size={20} className="text-gray-400" />
                        <span>{screenshotFile ? screenshotFile.name : 'Upload victory/loss screenshot'}</span>
                        <span className="text-[10px] text-gray-600">Max size: 5MB</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" variant="primary" isLoading={submittingResult} className="font-bold uppercase text-xs w-full mt-2">
                  Submit Result Proof
                </Button>
              </form>
            </Card>
          )}

          {/* Disputed Alert banner */}
          {battle.status === 'DISPUTED' && (
            <div className="flex items-start gap-3 border border-red-500/10 bg-red-500/[0.02] p-4 rounded-xl text-xs leading-relaxed text-red-300">
              <AlertTriangle size={18} className="shrink-0 text-red-500" />
              <div>
                <p className="font-bold uppercase tracking-wider text-red-400 mb-1">Match Disputed</p>
                <p>Both players reported conflicting results. An administrator has been assigned to verify screenshot uploads and settle payout pools manually.</p>
              </div>
            </div>
          )}

          {/* Victory Card */}
          {['COMPLETED', 'SETTLED'].includes(battle.status) && (
            <Card className="flex flex-col items-center justify-center text-center p-6" glow>
              <div className="p-3 bg-gameGold/10 rounded-full text-gameGold mb-3">
                <Trophy size={36} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Battle Settled!
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Payout of <span className="text-gameAccent font-black">{formatCurrency(battle.winnerAmount)}</span> has been credited to the victor's wallet.
              </p>
            </Card>
          )}
        </div>

        {/* Sidebar Actions / Invites */}
        <div className="flex flex-col gap-6">
          {battle.status === 'OPEN' && (
            <Card className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Challenge Invite
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                Share this lobby invite code with an opponent to start a private challenge match.
              </p>
              {battle.inviteCode ? (
                <div className="bg-gameCard/80 p-3 rounded-lg border border-white/5 flex items-center justify-between text-sm font-mono text-white select-all">
                  <span>{battle.inviteCode}</span>
                  <button onClick={handleCopyInviteCode}>
                    <Share2 size={14} className="text-gray-500 hover:text-white" />
                  </button>
                </div>
              ) : (
                isCreator ? (
                  <form onSubmit={handleInviteCodeSubmit} className="flex flex-col gap-2 mt-1">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={8}
                        value={newInviteCode}
                        onChange={(e) => setNewInviteCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 12345678"
                        className="flex-1 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-white placeholder-gray-500 outline-none text-xs focus:border-gameAccent/50 transition-colors"
                      />
                      <Button type="submit" variant="primary" isLoading={settingInviteCode} className="text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider">
                        Submit
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gameCard/80 p-3 rounded-lg border border-white/5 text-[11px] text-yellow-400 font-semibold italic text-center select-none animate-pulse">
                    Waiting for host to set room code...
                  </div>
                )
              )}

              {isCreator && (
                <Button variant="danger" onClick={handleCancel} className="text-xs font-bold uppercase w-full mt-2">
                  Cancel Lobby
                </Button>
              )}

              {!isCreator && !battle.joinedBy && (
                <Button variant="primary" onClick={handleJoin} className="text-xs font-bold uppercase w-full mt-2">
                  Accept Challenge
                </Button>
              )}
            </Card>
          )}

          {/* Active Battle Room Info Card */}
          {battle.status !== 'OPEN' && (
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                Room Info
              </h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 font-bold uppercase">Battle ID</span>
                  <span className="text-white font-mono select-all text-[11px]">{battle.id}</span>
                </div>
                
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 font-bold uppercase">Wager</span>
                  <span className="text-white font-black">{formatCurrency(battle.amount)}</span>
                </div>

                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 font-bold uppercase">Status</span>
                  <span className="text-gameAccent font-black uppercase tracking-wider">{battle.status}</span>
                </div>

                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-gray-500 font-bold uppercase">Invite Code</span>
                  {battle.inviteCode ? (
                    <div className="bg-gameCard/80 p-3 rounded-lg border border-white/5 flex items-center justify-between text-sm font-mono text-white select-all">
                      <span>{battle.inviteCode}</span>
                      <button onClick={handleCopyInviteCode} title="Copy invite code">
                        <Share2 size={14} className="text-gray-500 hover:text-white" />
                      </button>
                    </div>
                  ) : (
                    isCreator ? (
                      <form onSubmit={handleInviteCodeSubmit} className="flex flex-col gap-2 mt-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={8}
                            value={newInviteCode}
                            onChange={(e) => setNewInviteCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="e.g. 12345678"
                            className="flex-1 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg text-white placeholder-gray-500 outline-none text-xs focus:border-gameAccent/50 transition-colors"
                          />
                          <Button type="submit" variant="primary" isLoading={settingInviteCode} className="text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider">
                            Submit
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-gameCard/80 p-3 rounded-lg border border-white/5 text-[11px] text-yellow-400 font-semibold italic text-center select-none animate-pulse">
                        Waiting for host to set room code...
                      </div>
                    )
                  )}
                </div>

                {isParticipant && (battle.status === 'IN_PROGRESS' || battle.status === 'RESULT_SUBMITTED') && battle.inviteCode && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Button variant="secondary" onClick={handleOpenLudoKing} className="text-xs font-bold uppercase w-full flex items-center justify-center gap-2">
                      <Gamepad2 size={14} />
                      <span>Open Ludo King</span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Ludo King Instruction Fallback Modal */}
      <Modal isOpen={isLudoKingModalOpen} onClose={() => setIsLudoKingModalOpen(false)} title="Ludo King Play Instructions">
        <div className="flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
          <p className="font-semibold text-white">How to join and play in Ludo King:</p>
          <ol className="list-decimal list-inside flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-lg">
            <li>Open the <strong>Ludo King</strong> app on your mobile device or tablet.</li>
            <li>Tap on the <strong>Play with Friends</strong> game mode.</li>
            <li>Tap on <strong>Join Room</strong>.</li>
            <li>Paste or type the room invite code: <span className="text-gameAccent font-mono font-bold select-all bg-gameBg px-2 py-1 rounded border border-white/5">{battle.inviteCode || 'N/A'}</span></li>
            <li>Start the game, play fair, and take a screenshot of the final score screen (victory/defeat proof) when finished.</li>
          </ol>
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs text-gray-500 font-bold uppercase">Don't have Ludo King installed? Download it:</span>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.asantechr.ludoking"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-lg bg-white/[0.02] border border-white/5 text-center text-xs font-bold hover:bg-white/[0.05] text-white transition-colors"
              >
                Google Play Store
              </a>
              <a
                href="https://apps.apple.com/in/app/ludo-king/id993090598"
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-lg bg-white/[0.02] border border-white/5 text-center text-xs font-bold hover:bg-white/[0.05] text-white transition-colors"
              >
                Apple App Store
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

