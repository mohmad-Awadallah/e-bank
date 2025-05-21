// services/apiService.ts

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
    email: string;
    phoneNumber: string;
    username: string;
    password?: string;
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
export type TransactionType = 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REVERSAL';

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


export interface AccountCreationInput {
    userId: string;
    accountNumber: string;
    accountType: string;
    accountName: string;
    currency: string;
    initialDeposit?: number;
}


export interface BillPayment {
    id: string;
    accountId: string;
    receiptNumber: string;
    billerCode: string;
    amount: number;
    paymentDate: string;
    description?: string;
}

export interface CreateBillPaymentInput {
    accountId: string;
    billerCode: string;
    amount: number;
    description?: string;
}


export enum CardType {
    VISA = "VISA",
    MASTERCARD = "MASTERCARD",
    AMERICAN_EXPRESS = "AMERICAN_EXPRESS",
    DISCOVER = "DISCOVER"
}

export interface IssueCardParams {
    accountId: number;
    cardHolderName: string;
    cardType: CardType;
    creditLimit: number;
}


export interface CreditCardResponseDTO {
    id: number;
    cardNumber: string;
    cardHolderName: string;
    cardType: CardType;
    creditLimit: number;
    expiryDate: string;
    availableBalance: number;
    isActive: boolean;
}


export type WalletType = 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
export interface WalletDTO {
    id: number;
    walletAddress: string;
    walletType: 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
    linkedPhoneNumber: string;
    isVerified: boolean;
    balance?: number;
}

export interface CreateWalletDTO {
    userId: number;
    walletType: 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
    phoneNumber: string;
}

export type DiscountCoupon = {
    id: number;
    couponCode: string;
    description: string;
    discountType: 'FIXED_AMOUNT' | 'PERCENTAGE' | 'FREE_SHIPPING' | 'BUY_ONE_GET_ONE';
    discountValue: number;
    expiryDate: string;
    usageLimit: number;
};

export type SecurityLog = {
    id: number;
    message: string;
    timestamp: string;
    ipAddress: string;
    action: string;
    deviceInfo: string;
    status: string;
};

type SecurityLogPage = {
    content: SecurityLog[];
    totalPages: number;
    number: number;
};


export interface UpdateUserDetailsPayload {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    username?: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
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

    createAccount: async (
        input: AccountCreationInput
    ): Promise<Account> => {
        try {
            const response = await apiClient.post('/accounts', input);
            return response.data;
        } catch (error) {
            console.error('Error creating account:', error);
            throw new Error('Failed to create account');
        }
    },

    getAccountDetails: async (accountId: string): Promise<Account> => {
        try {
            const response = await apiClient.get(`/accounts/${accountId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching account details:', error);
            throw new Error('Failed to fetch account details');
        }
    },

    deposit: async (
        accountId: string,
        amount: number
    ): Promise<Account> => {
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
    },

    withdraw: async (
        accountId: string,
        amount: number
    ): Promise<Account> => {
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
    },

    makeTransfer: async (data: {
        sourceAccountNumber: string;
        targetAccountNumber: string;
        amount: number;
        reference: string;
        type: TransactionType;
    }) => {
        try {
            const response = await apiClient.post('/transactions/transfer', data);
            return response.data;
        } catch (error) {
            console.error('Error making transfer:', error);
            throw new Error('Failed to make transfer');
        }
    },

    // مدفوعات الفواتير
    getPaymentHistory: async (
        accountId: string
    ): Promise<BillPayment[]> => {
        try {
            const response = await apiClient.get<BillPayment[]>(
                `/bill-payments/account/${accountId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching payment history:', error);
            throw new Error('Failed to fetch payment history');
        }
    },



    createBillPayment: async (
        input: CreateBillPaymentInput
    ): Promise<BillPayment> => {
        try {
            const response = await apiClient.post<BillPayment>(
                '/bill-payments',
                null,
                {
                    params: {
                        accountId: input.accountId,
                        billerCode: input.billerCode,
                        customerReference: input.description,  // <= إعادة تسمية الحقل
                        amount: input.amount,
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating bill payment:', error);
            throw new Error('Failed to create bill payment');
        }
    },



    // بطاقات الائتمان
    getAccountCards: async (accountId: number): Promise<CreditCardResponseDTO[]> => {
        try {
            const response = await apiClient.get<CreditCardResponseDTO[]>(`/credit-cards/account/${accountId}`);
            console.log('Account cards:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching account cards:', error);
            throw new Error('Failed to fetch account cards');
        }
    },

    getCardDetails: async (cardId: number): Promise<CreditCardResponseDTO> => {
        try {
            const response = await apiClient.get<CreditCardResponseDTO>(`/credit-cards/${cardId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching card details:', error);
            throw new Error('Failed to fetch card details');
        }
    },

    makeCreditCardPayment: async (cardId: number, amount: number): Promise<any> => {
        try {
            const response = await apiClient.post(`/credit-cards/${cardId}/payments`, null, {
                params: { amount },
            });
            return response.data;
        } catch (error) {
            console.error(`Error making payment on card ${cardId}:`, error);
            throw new Error('Failed to make credit card payment');
        }
    },

    issueCreditCard: async ({
        accountId,
        cardHolderName,
        cardType,
        creditLimit,
    }: IssueCardParams): Promise<CreditCardResponseDTO> => {
        try {
            const response = await apiClient.post('/credit-cards', null, {
                params: {
                    accountId,
                    cardHolderName,
                    cardType,
                    creditLimit,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error issuing credit card:', error);
            throw new Error('Failed to issue credit card');
        }
    },


    // المحافظ الرقمية
    getUserWallets: async (userId: number): Promise<WalletDTO[]> => {
        try {
            const res = await apiClient.get(`/digital-wallets/user/${userId}`);
            return res.data;
        } catch (error) {
            console.error('Error fetching user wallets:', error);
            throw new Error('Failed to fetch user wallets');
        }
    },

    createWallet: async (data: CreateWalletDTO): Promise<WalletDTO> => {
        try {
            const res = await apiClient.post('/digital-wallets', null, {
                params: {
                    userId: data.userId,
                    walletType: data.walletType,
                    phoneNumber: data.phoneNumber,
                },
            });
            return res.data;
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw new Error('Failed to create wallet');
        }
    },

    updateWalletPhoneNumber: async (walletId: number, newPhoneNumber: string): Promise<WalletDTO> => {
        try {
            const res = await apiClient.patch(`/digital-wallets/${walletId}/phone-number`, null, {
                params: { newPhoneNumber },
            });
            return res.data;
        } catch (error) {
            console.error('Error updating wallet phone number:', error);
            throw new Error('Failed to update wallet phone number');
        }
    },


    // الكوبونات
    fetchCoupons: async (): Promise<DiscountCoupon[]> => {
        try {
            const response = await apiClient.get("coupons/active");
            return response.data;
        } catch (error) {
            console.error('Error fetching coupons:', error);
            throw new Error('Failed to fetch coupons');
        }
    },


    // --- سجلات الأمان ---
    getUserSecurityLogs: async (
        userId: number,
        page: number = 0,
        size: number = 10
    ): Promise<SecurityLogPage> => {
        try {
            const res = await apiClient.get(`/security-logs/user/${userId}`, {
                params: { page, size },
            });
            return res.data;
        } catch (error) {
            console.error('Error fetching user security logs:', error);
            throw new Error('Failed to fetch user security logs');
        }
    },


    // --- تحديث بيانات المستخدم ---
    changePassword: async (
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> => {
        try {
            await apiClient.patch(`/users/${userId}/change-password`, {
                currentPassword,
                newPassword,
            });
        } catch (error) {
            console.error('Error changing password:', error);
            throw new Error('Failed to change password');
        }
    },

    updateUser: async (
        userId: number,
        userDetails: UpdateUserDetailsPayload
    ): Promise<User> => {
        try {
            const response = await apiClient.put(`/users/${userId}`, userDetails);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw new Error('Failed to update user');
        }
    },


    // --- الإشعارات ---
    getDashboardNotifications: async (userId: string) => {
        try {
            const res = await apiClient.get(`/notifications/user/${userId}`);
            return res.data.content;
        } catch (error) {
            console.error('Error fetching dashboard notifications:', error);
            throw new Error('Failed to fetch dashboard notifications');
        }
    },

    markNotificationAsRead: async (notificationId: string) => {
        try {
            await apiClient.patch(`/notifications/${notificationId}/read`);
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error('Failed to mark notification as read');
        }
    },

};

export default apiClient;
