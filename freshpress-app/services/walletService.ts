import { axiosInstance } from './axiosInstance';

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: string;
  closingBalance: string;
  description: string;
  createdAt: string;
}

export interface WalletData {
  id: string;
  balance: string;
  transactions: WalletTransaction[];
}

export const getWallet = async (): Promise<WalletData> => {
  const response = await axiosInstance.get('/v1/wallet');
  return response.data.data;
};

export const topUpWallet = async (amount: number): Promise<WalletData> => {
  const response = await axiosInstance.post('/v1/wallet/topup', { amount });
  return response.data.data;
};
