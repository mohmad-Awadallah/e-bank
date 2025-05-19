// services/bill-payment.ts

import apiClient from '@/lib/apiClient';
import { Account } from '@/types/auth';


/**
 * Represents a bill payment record.
 */
export interface BillPayment {
    id: string;
    accountId: string;
    receiptNumber: string;
    billerCode: string;
    amount: number;
    paymentDate: string;
    description?: string;
}


export const getUserAccounts = async (userId: string): Promise<Account[]> => {
    try {
        const response = await apiClient.get(`/accounts/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user accounts:', error);
        throw new Error('Failed to fetch user accounts');
    }
};

/**
 * Input payload for creating a new bill payment.
 */
export interface CreateBillPaymentInput {
    accountId: string;
    billerCode: string;
    amount: number;
    description?: string;
}

/**
 * Fetches the payment history for a given account.
 * @param accountId - The ID of the account.
 * @returns An array of BillPayment records.
 */
export const getPaymentHistory = async (
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
};

/**
 * Creates a new bill payment for an account.
 * @param input - The details of the bill payment to create.
 * @returns The created BillPayment record.
 */
export const createBillPayment = async (
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
                    customerReference: input.description,  // <= هنا نُعيد تسمية الحقل
                    amount: input.amount,
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating bill payment:', error);
        throw new Error('Failed to create bill payment');
    }
};


/**
 * Fetches a single bill payment record by its ID.
 * @param paymentId - The ID of the bill payment.
 * @returns The BillPayment record.
 */
export const getBillPaymentById = async (
    paymentId: string
): Promise<BillPayment> => {
    try {
        const response = await apiClient.get<BillPayment>(
            `/bill-payments/${paymentId}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching bill payment details:', error);
        throw new Error('Failed to fetch bill payment details');
    }
};

/**
 * Deletes a bill payment record by its ID.
 * @param paymentId - The ID of the bill payment to delete.
 */
export const deleteBillPayment = async (
    paymentId: string
): Promise<void> => {
    try {
        await apiClient.delete(`/bill-payments/${paymentId}`);
    } catch (error) {
        console.error('Error deleting bill payment:', error);
        throw new Error('Failed to delete bill payment');
    }
};
// افترض أن لديك هذا النوع في مكان ما
// Duplicate declaration removed as it already exists above.