// services/account.ts

import apiClient from '@/lib/apiClient';
import { Account } from '@/types/auth';


export const getUserAccounts = async (userId: string): Promise<Account[]> => {
  try {
    const response = await apiClient.get(`/accounts/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user accounts:', error);
    throw new Error('Failed to fetch user accounts');
  }
};


export const getAccountDetails = async (accountId: string): Promise<Account> => {
  try {
    const response = await apiClient.get(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account details:', error);
    throw new Error('Failed to fetch account details');
  }
};


export interface AccountCreationInput {
  userId: string;
  accountNumber: string;
  accountType: string;
  accountName: string;
  currency: string;
  initialDeposit?: number;
}


export const createAccount = async (
  input: AccountCreationInput
): Promise<Account> => {
  try {
    const response = await apiClient.post('/accounts', input);
    return response.data;
  } catch (error) {
    console.error('Error creating account:', error);
    throw new Error('Failed to create account');
  }
};


export const deposit = async (accountId: string, amount: number): Promise<Account> => {
  if (amount <= 0) throw new Error('Deposit amount must be greater than zero');

  try {
    const response = await apiClient.post<Account>(
      `/accounts/${accountId}/deposit?amount=${amount}`
    );
    return response.data;
  } catch (error) {
    console.error('Error depositing funds:', error);
    throw new Error('Failed to deposit funds');
  }
};

export const withdraw = async (accountId: string, amount: number): Promise<Account> => {
  if (amount <= 0) throw new Error('Withdrawal amount must be greater than zero');

  try {
    const response = await apiClient.post<Account>(
      `/accounts/${accountId}/withdraw?amount=${amount}`
    );
    return response.data;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    throw new Error('Failed to withdraw funds');
  }
};


// للحصول على الرصيد
export const getAccountBalance = async (accountId: string): Promise<number> => {
  try {
    const response = await apiClient.get(`/accounts/${accountId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw new Error('Failed to fetch account balance');
  }
};

// لتحويل الأموال بين الحسابات
export const transferFunds = async (
  sourceAccountId: string,
  targetAccountId: string,
  amount: number
): Promise<void> => {
  if (amount <= 0) throw new Error('Transfer amount must be greater than zero');

  try {
    await apiClient.post(
      `/accounts/transfer?sourceAccountId=${sourceAccountId}&targetAccountId=${targetAccountId}&amount=${amount}`
    );
  } catch (error) {
    console.error('Error transferring funds:', error);
    throw new Error('Failed to transfer funds');
  }
};

// لتنشيط الحساب
export const activateAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.patch(`/accounts/${accountId}/activate`);
  } catch (error) {
    console.error('Error activating account:', error);
    throw new Error('Failed to activate account');
  }
};

// لإلغاء تنشيط الحساب
export const deactivateAccount = async (accountId: string): Promise<void> => {
  try {
    await apiClient.patch(`/accounts/${accountId}/deactivate`);
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw new Error('Failed to deactivate account');
  }
};

// البحث عن الحسابات بناءً على الاستعلام
export const searchAccounts = async (query: string): Promise<Account[]> => {
  try {
    const response = await apiClient.get(`/accounts/search?query=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching accounts:', error);
    throw new Error('Failed to search accounts');
  }
};

// الحصول على الحسابات حسب النوع
export const getAccountsByType = async (accountType: string): Promise<Account[]> => {
  try {
    const response = await apiClient.get(`/accounts/type/${accountType}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching accounts by type:', error);
    throw new Error('Failed to fetch accounts by type');
  }
};

// تحديث تفاصيل الحساب
export const updateAccountDetails = async (
  accountId: string,
  updatedAccount: Account
): Promise<Account> => {
  try {
    const response = await apiClient.put(`/accounts/${accountId}`, updatedAccount);
    return response.data;
  } catch (error) {
    console.error('Error updating account details:', error);
    throw new Error('Failed to update account details');
  }
};

// الحصول على الحساب باستخدام رقم الحساب
export const getAccountByNumber = async (accountNumber: string): Promise<Account> => {
  try {
    const response = await apiClient.get(`/accounts/by-number/${accountNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account by number:', error);
    throw new Error('Failed to fetch account by number');
  }
};
