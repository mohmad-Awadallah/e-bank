// services/transaction.ts


import apiClient from '@/lib/apiClient';
import { TransactionType } from '@/types/auth';


// جلب المعاملات للمستخدم باستخدام معرف المستخدم
export const getUserTransactions = async (userId: number) => {
  const response = await apiClient.get(`/transactions/user/${userId}`);
  return response.data;
};

// تنفيذ عملية تحويل
export const makeTransfer = async (data: {
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  reference: string;
  type: TransactionType;
}) => {
  const response = await apiClient.post('/transactions/transfer', data);
  return response.data;
};
1