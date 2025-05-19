// services/credit-cards.ts
import apiClient from '@/lib/apiClient';

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

export const issueCreditCard = async ({
    accountId,
    cardHolderName,
    cardType,
    creditLimit,
}: IssueCardParams) => {
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
};


export const getAccountCards = async (accountId: number) => {
    try {
        const response = await apiClient.get<CreditCardResponseDTO[]>(`/credit-cards/account/${accountId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching account cards:', error);
        throw new Error('Failed to fetch account cards');
    }
};

export const getCardDetails = async (cardId: number) => {
    try {
        const response = await apiClient.get<CreditCardResponseDTO>(`/credit-cards/${cardId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching card details:', error);
        throw new Error('Failed to fetch card details');
    }
};

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


export const makeCreditCardPayment = async (cardId: number, amount: number) => {
    try {
        const response = await apiClient.post(`/credit-cards/${cardId}/payments`, null, {
            params: { amount },
        });
        return response.data;
    } catch (error) {
        console.error(`Error making payment on card ${cardId}:`, error);
        throw new Error('Failed to make credit card payment');
    }
};


export const deactivateCreditCard = async (cardId: number) => {
    try {
        await apiClient.delete(`/credit-cards/${cardId}`);
    } catch (error) {
        console.error(`Error deactivating credit card ${cardId}:`, error);
        throw new Error('Failed to deactivate credit card');
    }
};