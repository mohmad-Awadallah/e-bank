import axios, { AxiosError, AxiosResponse } from 'axios';
import { Platform } from 'react-native';

// تحديد المضيف المحلي للإيموليتر
const LOCAL_HOST = Platform.select({
    android: '10.0.2.2',
    ios: 'localhost',
    default: 'localhost',
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

// اعتراض الأخطاء العامة
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn('Authentication error: Please log in again.');
        }
        return Promise.reject(error);
    }
)


export interface User {
    id: string
    userId: string;
    firstName: string;
    lastName: string;
    role?: string;
};

// --- الواجهات ---
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
type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REVERSAL';

export interface ApiTransaction {
    id: number;
    amount: number;
    type: TransactionType;
    date: string;
    description: string;
    sourceAccountNumber: string;
    targetAccountNumber: string;
    accountNumber: string;
    currency: string;
}

export interface TransactionDisplay {
    id: string;
    title: string;
    category: string;
    formattedDate: string;
    displayAmount: string;
    amount: number;
    isCredit: boolean;
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

// --- واجهة API ---
export const api = {
    // المصادقة
    register: (credentials: RegisterCredentials) =>
        apiClient.post('/auth/register', credentials),

    login: (credentials: { username: string; password: string }) =>
        apiClient.post('/auth/login', credentials),

    logout: () => apiClient.post('/auth/logout'),

    // المستخدم
    getCurrentUser: () => apiClient.get('/users/me'),

    // الحسابات
    getUserAccounts: (userId: string, options?: { signal?: AbortSignal }) =>
        apiClient.get(`/accounts/user/${userId}`, { signal: options?.signal }),

    // المعاملات
    getUserTransactions: (userId: string, options?: { signal?: AbortSignal }) =>
        apiClient.get(`/transactions/user/${userId}`, { signal: options?.signal }),

    getRecentTransactions: (
        accountNumber: string,
        count: number = 10,
        options?: { signal?: AbortSignal }
    ) =>
        apiClient.get(
            `/transactions/account/${accountNumber}/recent?count=${count}`,
            { signal: options?.signal }
        ),

    // التحليلات
    getSpendingData: (accountNumber: string, options?: { signal?: AbortSignal }) =>
        apiClient
            .get(`/analytics/spending`, {
                params: { accountNumber },
                signal: options?.signal,
            })
            .then(res => res.data as SpendingData),

    getMonthlyTrendsData: (accountNumber: string, options?: { signal?: AbortSignal }) =>
        apiClient
            .get(`/analytics/monthly`, {
                params: { accountNumber },
                signal: options?.signal,
            })
            .then(res => res.data as MonthlyTrendsData),

};

export default apiClient;
