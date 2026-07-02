'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Wallet, Plus, ArrowUpRight, FileSpreadsheet, RefreshCw, Award } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setWalletBalances } from '@/features/wallet/walletSlice';
import walletService from '@/services/wallet.service';
import transactionService from '@/services/transaction.service';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Table from '@/components/Table';
import LoadingState from '@/components/LoadingState';
import { formatCurrency, formatDate, cn } from '@/utils';

// Validation Schemas (Withdrawal only, Deposit uses preset options & direct gateway trigger)
const withdrawSchema = z.object({
  amount: z.preprocess((val) => (val === '' ? undefined : Number(val)), z.number().positive('Amount must be positive')),
  paymentMethod: z.string().min(2, 'Payment method is required'),
  paymentDetails: z.string().min(5, 'Details are required'),
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

// Dynamic loader for Razorpay script
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function WalletDashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { depositBalance, winningBalance, bonusBalance, totalBalance, lifetimeBonus } = useAppSelector((state) => state.wallet);

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Dialog Controls
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('500'); // Default preset to 500
  const [submitLoading, setSubmitLoading] = useState(false);

  const presetAmounts = [100, 500, 1000, 2000, 5000];

  const { register: regWit, handleSubmit: subWit, reset: resWit, formState: { errors: errWit } } = useForm<WithdrawValues>({
    resolver: zodResolver(withdrawSchema),
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const bal = await walletService.getBalance();
      dispatch(setWalletBalances(bal));

      const txs = await transactionService.getTransactionHistory();
      setTransactions(txs);
    } catch (err) {
      // Capture error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRazorpayPayment = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid deposit amount.');
      return;
    }

    setSubmitLoading(true);
    try {
      // 1. Load script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      // 2. Create Razorpay order in backend (logs pending transaction)
      const orderData = await walletService.createRazorpayOrder(amt);

      // 3. Setup checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'BattleLudo Arena',
        description: `Wallet Deposit ₹${amt}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          setSubmitLoading(true);
          try {
            // Verify payment signature
            await walletService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amt,
            });
            toast.success('Payment verified! Wallet credited successfully.');
            setIsDepositOpen(false);
            loadData(); // reload balances and history
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed. Please contact support.');
          } finally {
            setSubmitLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || '',
        },
        theme: {
          color: '#00E5FF', // gameAccent color
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled by user.');
            setSubmitLoading(false);
            loadData(); // reload to show pending transaction status
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (resp: any) {
        toast.error(resp.error.description || 'Payment transaction failed.');
        setSubmitLoading(false);
        loadData(); // reload to show failed transaction status
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Failed to initiate payment.');
      setSubmitLoading(false);
    }
  };

  const onWithdrawSubmit = async (values: WithdrawValues) => {
    if (values.amount > winningBalance) {
      toast.error('Withdrawal amount exceeds winning balance.');
      return;
    }
    setSubmitLoading(true);
    try {
      await walletService.createWithdrawalRequest(values);
      toast.success('Withdrawal request registered!');
      setIsWithdrawOpen(false);
      resWit();
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Withdrawal submission failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Wallet Overview
          </h1>
          <p className="text-xs text-gray-500 font-bold uppercase mt-0.5">
            Manage deposit wagers, credit payouts, and withdrawal requests
          </p>
        </div>

        {/* Sync trigger */}
        <button
          onClick={loadData}
          className="text-xs font-bold text-gameAccent hover:underline flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw size={12} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Balance details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center justify-between" glow>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Winning Wallet</span>
            <span className="text-2xl font-black text-white">{formatCurrency(winningBalance)}</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsWithdrawOpen(true)} className="flex items-center gap-1.5 font-bold uppercase text-xs">
            <ArrowUpRight size={14} />
            <span>Withdraw</span>
          </Button>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Deposit Wallet</span>
            <span className="text-2xl font-black text-white">{formatCurrency(depositBalance)}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsDepositOpen(true)} className="flex items-center gap-1.5 font-bold uppercase text-xs">
            <Plus size={14} />
            <span>Deposit</span>
          </Button>
        </Card>

        <Card className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bonus (Lifetime)</span>
            <span className="text-2xl font-black text-white">{formatCurrency(lifetimeBonus)}</span>
          </div>
          <div className="p-3 bg-gameGold/10 rounded-xl text-gameGold">
            <Award size={20} />
          </div>
        </Card>
      </div>

      {/* Transaction History Log Tables */}
      {loading ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Main Transaction Logs */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-gameAccent" />
              <span>Wallet Ledger Logs</span>
            </h2>
            <Table
              data={transactions}
              columns={[
                { header: 'Date', accessor: (row) => formatDate(row.createdAt) },
                {
                  header: 'Type', accessor: (row) => (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      row.type === 'DEPOSIT' && 'bg-green-500/20 text-green-400',
                      row.type === 'WITHDRAW' && 'bg-red-500/20 text-red-400',
                      row.type === 'BATTLE_ENTRY' && 'bg-gamePurple/20 text-gamePurple',
                      row.type === 'BATTLE_WIN' && 'bg-gameAccent/20 text-gameAccent'
                    )}>
                      {row.type}
                    </span>
                  )
                },
                {
                  header: 'Amount', accessor: (row) => (
                    <span className={cn(
                      'font-bold',
                      ['DEPOSIT', 'BATTLE_WIN', 'BATTLE_REFUND', 'REFERRAL_BONUS', 'ADMIN_CREDIT'].includes(row.type)
                        ? 'text-green-400'
                        : 'text-red-400'
                    )}>
                      {['DEPOSIT', 'BATTLE_WIN', 'BATTLE_REFUND', 'REFERRAL_BONUS', 'ADMIN_CREDIT'].includes(row.type) ? '+' : '-'}
                      {formatCurrency(row.amount)}
                    </span>
                  )
                },
                {
                  header: 'Status', accessor: (row) => (
                    <span className={cn(
                      'text-[9px] font-black tracking-wider px-2 py-0.5 rounded uppercase',
                      row.status === 'SUCCESS' && 'bg-green-500/20 text-green-400',
                      row.status === 'PENDING' && 'bg-gameGold/20 text-gameGold',
                      row.status === 'FAILED' && 'bg-red-500/20 text-red-400'
                    )}>
                      {row.status}
                    </span>
                  )
                },
                { header: 'Payment ID', accessor: (row) => row.razorpayPaymentId || 'N/A' },
                { header: 'Description', accessor: 'description' },
              ]}
              emptyMessage="No ledger logs recorded for this wallet."
            />
          </div>
        </div>
      )}

      {/* Add Money (Razorpay Gateway) Modal */}
      <Modal isOpen={isDepositOpen} onClose={() => setIsDepositOpen(false)} title="Add Money to Wallet">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Select Preset Amount</span>
            <div className="grid grid-cols-5 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt.toString())}
                  className={cn(
                    'py-2 px-1 text-xs font-bold rounded-lg border transition-all duration-200',
                    depositAmount === amt.toString()
                      ? 'bg-gameAccent/10 border-gameAccent text-gameAccent'
                      : 'bg-white/[0.01] border-white/5 text-gray-400 hover:bg-white/[0.03] hover:text-white'
                  )}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase">Or Enter Custom Amount (₹)</label>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-gameBg border border-white/5 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-gameAccent/50 transition-colors"
            />
          </div>

          <Button
            onClick={handleRazorpayPayment}
            variant="primary"
            isLoading={submitLoading}
            className="w-full mt-2 font-bold uppercase text-xs"
          >
            Proceed to Pay ₹{depositAmount || '0'}
          </Button>
        </div>
      </Modal>

      {/* Withdrawal Request Modal */}
      <Modal isOpen={isWithdrawOpen} onClose={() => setIsWithdrawOpen(false)} title="Withdraw winnings">
        <form onSubmit={subWit(onWithdrawSubmit)} className="flex flex-col gap-4">
          <div className="text-xs text-gray-500 font-bold uppercase mb-2">
            Available winnings: <span className="text-gameAccent">{formatCurrency(winningBalance)}</span>
          </div>
          <Input label="Amount to Withdraw (₹)" type="number" error={errWit.amount?.message} {...regWit('amount')} />
          <Select
            label="Payout Method"
            options={[
              { label: 'UPI Address', value: 'UPI' },
              { label: 'Bank Account (IMPS)', value: 'BANK' },
            ]}
            error={errWit.paymentMethod?.message}
            {...regWit('paymentMethod')}
          />
          <Input label="Payout address details" placeholder="UPI handle or Account details (IFSC, Account No)" error={errWit.paymentDetails?.message} {...regWit('paymentDetails')} />
          <Button type="submit" variant="primary" isLoading={submitLoading} className="w-full mt-2 font-bold uppercase text-xs">
            Register Withdrawal Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
