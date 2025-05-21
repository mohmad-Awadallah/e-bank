// services/security.ts


import apiClient from '@/lib/apiClient';

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

export const getUserSecurityLogs = async (
    userId: number,
    page: number = 0,
    size: number = 10
): Promise<SecurityLogPage> => {
    const res = await apiClient.get(`/security-logs/user/${userId}`, {
        params: { page, size },
    });
    return res.data;
};

export const getFailedAttempts = async (userId: number, maxAttempts = 5) => {
    const res = await apiClient.get(`/security-logs/user/${userId}/failed-attempts`, {
        params: { maxAttempts },
    });
    return res.data;
};

export const hasSuspiciousActivity = async (userId: number) => {
    const res = await apiClient.get(`/security-logs/user/${userId}/suspicious-activity`);
    return res.data;
};

// Admin-only
export const getLogsByIpAddress = async (ipAddress: string) => {
    const res = await apiClient.get(`/security-logs/ip/${ipAddress}`);
    return res.data;
};

export const deleteSecurityLog = async (logId: number) => {
    await apiClient.delete(`/security-logs/${logId}`);
};


