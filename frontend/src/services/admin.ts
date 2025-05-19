// services/admin.ts


import apiClient from '@/lib/apiClient';
import { date } from 'zod';

// Function to update user role
export const updateUserRole = async (userId: number, newRole: string) => {
    try {
        const response = await apiClient.put(`/users/${userId}`, { role: `ROLE_${newRole}` });
        return response.data;  // Return the response data after successful update
    } catch (err) {
        console.error('Error updating user role:', err);
        throw new Error('Failed to update user role');  // Handle error and throw it to be caught in the calling function
    }
};

// Function to fetch admin stats (example usage)
export const fetchAdminStats = async () => {
    try {
        const response = await apiClient.get('/admin/stats');
        return response.data;
    } catch (err) {
        console.error('Error fetching stats:', err);
        throw new Error('Failed to fetch stats');
    }
};

// Function to fetch recent users (example usage)
export const fetchRecentUsers = async () => {
    try {
        const response = await apiClient.get('/admin/users/recent');
        return response.data;
    } catch (err) {
        console.error('Error fetching recent users:', err);
        throw new Error('Failed to fetch recent users');
    }
};
