// src/services/dashboard.ts
import apiClient from '@/lib/apiClient';

export interface ApiTransaction {
  id: number;
  amount: number;
  date: string;
  description: string;
  type: string;
  sourceAccountNumber: string;
  targetAccountNumber: string;
  accountNumber: string;
  currency: string;
}

export async function getUserTransactions(userId: string): Promise<ApiTransaction[]> {
  const res = await apiClient.get(`/transactions/user/${userId}`);
  return res.data;
}

export async function getRecentTransactions(accountNumber: string, count: number = 10): Promise<ApiTransaction[]> {
  const res = await apiClient.get(`/transactions/account/${accountNumber}/recent`, {
    params: { count },
  });
  return res.data;
}


