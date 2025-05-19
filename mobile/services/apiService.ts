// services/apiService.ts

import axios, { AxiosError, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { format } from 'date-fns';

// Configure emulator hosts
const LOCAL_HOST = Platform.select({
    android: '10.0.2.2',    // Android emulator
    ios: 'localhost',       // iOS simulator / macOS
    default: 'localhost',   // Web or others
});

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || `http://${LOCAL_HOST}:8080/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 10000,
});

// --- Interfaces ---
export interface Account {
    id: number;
    accountNumber: string;
    balance: number;
    currency: string;
    transactions: ApiTransaction[];
    accountType: 'CURRENT' | 'SAVINGS' | 'LOAN' | 'CREDIT';
    accountName: string;
    status: 'ACTIVE' | 'INACTIVE' | 'CLOSED';
    active: boolean;
}

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

export interface SpendingData {
    labels: string[];
    values: number[];
}

export interface MonthlyTrendsData {
    labels: string[];
    values: number[];
}

export interface RegisterCredentials {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}

// Interface for mapped transaction display
export interface TransactionDisplay {
    id: string;
    title: string;
    displayAmount: string;
    formattedDate: string;
    category: string;
    isCredit: boolean;
}

// Response interceptor for unified error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn('Authentication error: Please log in again.');
        }
        return Promise.reject(error);
    }
);

// API methods
export const api = {
    // Auth
    register: (credentials: RegisterCredentials) =>
        apiClient.post('/auth/register', credentials),

    login: (credentials: { username: string; password: string }) =>
        apiClient.post('/auth/login', credentials),

    logout: () => apiClient.post('/auth/logout'),

    // User
    getCurrentUser: () => apiClient.get('/users/me'),

    // Accounts
    getUserAccounts: (userId: string, options?: { signal?: AbortSignal }) =>
        apiClient.get(`/accounts/user/${userId}`, {
            signal: options?.signal,
        }),

    // Transactions
    getUserTransactions: (userId: string, options?: { signal?: AbortSignal }) =>
        apiClient.get(`/transactions/user/${userId}`, {
            signal: options?.signal,
        }),

    getRecentTransactions: (
        accountNumber: string,
        count: number = 10,
        options?: { signal?: AbortSignal }
    ) =>
        apiClient.get(
            `/transactions/account/${accountNumber}/recent?count=${count}`,
            { signal: options?.signal }
        ),

    // Analytics
    getSpendingData: (options?: { signal?: AbortSignal }): Promise<SpendingData> =>
        apiClient
            .get('/analytics/spending', {
                signal: options?.signal,
            })
            .then(res => res.data as SpendingData),

    getMonthlyTrendsData: (options?: { signal?: AbortSignal }): Promise<MonthlyTrendsData> =>
        apiClient
            .get('/analytics/monthly', {
                signal: options?.signal,
            })
            .then(res => res.data as MonthlyTrendsData),
};

export const mapApiTransactions = (transactions: ApiTransaction[]): TransactionDisplay[] => {
    return transactions.map(tx => {
        const isCredit = tx.targetAccountNumber === tx.accountNumber;
        return {
            id: tx.id.toString(),
            title: tx.description,
            displayAmount: `${isCredit ? '+' : '-'}${tx.currency}${tx.amount.toFixed(2)}`,
            formattedDate: format(new Date(tx.date), 'MMM d, yyyy h:mm a'),
            category: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
            isCredit,
        };
    });
};

export const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
};

export default apiClient;
