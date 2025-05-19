import apiClient from '@/lib/apiClient';

export type WalletType = 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
export interface WalletDTO {
    id: number;
    walletAddress: string;
    walletType: 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
    linkedPhoneNumber: string;
    isVerified: boolean;
    balance?: number; 
}


export const getUserWallets = async (userId: number): Promise<WalletDTO[]> => {
    const res = await apiClient.get(`/digital-wallets/user/${userId}`);
    return res.data;
};

export interface CreateWalletDTO {
    userId: number;
    walletType: 'APPLE_PAY' | 'GOOGLE_PAY' | 'SAMSUNG_PAY' | 'PAYPAL' | 'OTHER';
    phoneNumber: string;
}


export const createWallet = async (data: CreateWalletDTO) => {
    const res = await apiClient.post('/digital-wallets', null, {
        params: {
            userId: data.userId,
            walletType: data.walletType,
            phoneNumber: data.phoneNumber
        }
    });
    return res.data;
};


export const updateWalletPhoneNumber = async (walletId: number, newPhoneNumber: string): Promise<WalletDTO> => {
    const res = await apiClient.patch(`/digital-wallets/${walletId}/phone-number`, null, {
        params: { newPhoneNumber },
    });
    return res.data;
};


export const verifyWallet = async (walletId: number, verificationCode: string): Promise<WalletDTO> => {
    const res = await apiClient.patch(`/digital-wallets/${walletId}/verify`, null, {
        params: { verificationCode },
    });
    return res.data;
};

export const deleteWallet = async (walletId: number): Promise<void> => {
    await apiClient.delete(`/digital-wallets/${walletId}`);
};

export const getWalletById = async (walletId: number): Promise<WalletDTO> => {
    const res = await apiClient.get(`/digital-wallets/${walletId}`);
    return res.data;
};

export const checkWalletVerificationStatus = async (walletId: number): Promise<boolean> => {
    const res = await apiClient.get(`/digital-wallets/${walletId}/verification-status`);
    return res.data;
};

export const getWalletByAddress = async (walletAddress: string): Promise<WalletDTO> => {
    const res = await apiClient.get(`/digital-wallets/address/${walletAddress}`);
    return res.data;
};