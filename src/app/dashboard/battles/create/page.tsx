'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus } from 'lucide-react';
import battleService from '@/services/battle.service';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { formatCurrency } from '@/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings, setSettingsLoading, setSettingsError } from '@/features/settings/settingsSlice';
import settingsService from '@/services/settings.service';

const createBattleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number({ required_error: 'Amount is required' }).positive('Amount must be greater than 0')
  ),
  inviteCode: z.string().optional(),
});

type CreateBattleValues = z.infer<typeof createBattleSchema>;

export default function CreateBattlePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { values: settings } = useAppSelector((state) => state.settings);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateBattleValues>({
    resolver: zodResolver(createBattleSchema),
    defaultValues: {
      title: 'Ludo Classic Battle',
      amount: 50,
    },
  });

  const watchAmount = watch('amount') || 0;
  const commission = Number(settings.COMMISSION_PERCENTAGE || 0);
  const winnerPayout = watchAmount * 2 - (watchAmount * 2 * commission) / 100;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch(setSettingsLoading(true));
        const publicSettings = await settingsService.getPublicSettings();
        dispatch(setSettings(publicSettings));
      } catch (error: any) {
        dispatch(setSettingsError(error.message || 'Failed to load settings'));
      } finally {
        dispatch(setSettingsLoading(false));
      }
    };

    loadSettings();
  }, [dispatch]);

  const onSubmit = async (values: CreateBattleValues) => {
    setLoading(true);
    try {
      const battle = await battleService.createBattle(values);
      toast.success('Battle lobby created successfully!');
      router.push(`/dashboard/battles/${battle.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create battle. Check balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/battles"
          className="p-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-all duration-200"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            Create Battle
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Define entry wager and invite arena opponents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <Card className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Input
              label="Battle Title"
              placeholder="e.g. Classic Ludo Match"
              error={errors.title?.message}
              {...register('title')}
            />

            <Input
              label="Entry Wage Amount (₹)"
              placeholder="e.g. 100"
              type="number"
              error={errors.amount?.message}
              {...register('amount')}
            />

            <Input
              label="Invite Code (Optional)"
              placeholder="e.g. LK123456"
              error={errors.inviteCode?.message}
              {...register('inviteCode')}
            />

            <div className="border-t border-white/5 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Total Pool:</span>
                <span className="text-white font-bold">{formatCurrency(watchAmount * 2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                <span>Platform Commission:</span>
                <span className="text-white font-bold">{commission}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gameAccent font-extrabold border-t border-white/5 pt-2">
                <span>Winner Payout:</span>
                <span className="glow-accent">{formatCurrency(winnerPayout > 0 ? winnerPayout : 0)}</span>
              </div>
            </div>

            <Button type="submit" variant="primary" isLoading={loading} className="w-full font-black uppercase tracking-wider flex items-center gap-2 mt-2">
              <Plus size={16} />
              <span>Launch Battle Lobby</span>
            </Button>
          </form>
        </Card>

        {/* Informational Panel */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-2">
              Lobby Rules
            </h3>
            <ul className="text-xs text-gray-400 leading-relaxed font-semibold flex flex-col gap-2.5 list-disc list-inside">
              <li>Entry wages are deducted from your balance immediately to secure the match.</li>
              <li>If no opponent joins, you can cancel the lobby to receive a full refund.</li>
              <li>Sharing the invite code enables direct private matches.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
