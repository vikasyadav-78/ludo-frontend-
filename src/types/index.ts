export type UserRole = 'USER' | 'ADMIN' | 'SUPPORT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  mobileVerified?: boolean;
  emailVerified?: boolean;
}

export type BattleStatus =
  | 'OPEN'
  | 'JOINED'
  | 'IN_PROGRESS'
  | 'RESULT_SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED';

export interface Battle {
  id: string;
  title: string;
  amount: number;
  commission: number;
  winnerAmount: number;
  inviteCode?: string;
  createdBy: { id: string; name: string; avatar?: string };
  joinedBy?: { id: string; name: string; avatar?: string };
  status: BattleStatus;
  winner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BattleParticipant {
  id: string;
  battleId: string;
  userId: string;
  role: 'CREATOR' | 'JOINER';
  screenshotUrl?: string;
  submittedResult?: 'WIN' | 'LOSS' | 'CANCEL';
  resultSubmittedAt?: string;
}

export interface BattleResult {
  id: string;
  battleId: string;
  submittedBy: string;
  screenshotUrl?: string;
  status: 'WIN' | 'LOSS' | 'CANCEL';
  adminDecision?: 'APPROVED' | 'REJECTED' | 'DISPUTED_RESOLVED';
  updatedBy?: string;
}

export interface Wallet {
  depositBalance: number;
  winningBalance: number;
  bonusBalance: number;
  totalBalance: number;
}

export type TransactionType =
  | 'DEPOSIT'
  | 'WITHDRAW'
  | 'BATTLE_ENTRY'
  | 'BATTLE_WIN'
  | 'BATTLE_REFUND'
  | 'REFERRAL_BONUS'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT';

export interface Transaction {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  type: TransactionType;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  referenceId?: string;
  description?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  paymentMethod: string;
  paymentDetails: string;
  rejectedReason?: string;
  processedAt?: string;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentMethod: string;
  screenshotUrl?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'BATTLE' | 'WALLET' | 'SYSTEM';
  readStatus: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'PAYMENT' | 'BATTLE' | 'TECHNICAL' | 'OTHER';
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: { id: string; name: string; avatar?: string; role: UserRole };
  senderRole: UserRole;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredId: { id: string; name: string; status: UserStatus };
  referralCode: string;
  createdAt: string;
}

export interface ReferralReward {
  id: string;
  referrerId: string;
  referredId: { id: string; name: string; email: string };
  amount: number;
  status: 'PENDING' | 'CLAIMED';
  createdAt: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  winnings: number;
  wins: number;
}

export interface ReferrerUser {
  rank: number;
  name: string;
  referralsCount: number;
  bonusEarned: number;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}
