// src/services/user.ts


import apiClient from '@/lib/apiClient';

export interface patchUserStatusPayload {
  enabled: boolean;
}

export interface UpdateUserDetailsPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  username?: string;
}

const userService = {
  async getAllUsers() {
    const response = await apiClient.get('/users');
    return response.data;
  },

  async patchUserStatus(userId: number, payload: patchUserStatusPayload) {
    return await apiClient.patch(`/users/${userId}/toggle-status?enabled=${payload.enabled}`);
  },


  async getUserById(userId: number) {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: number, userDetails: UpdateUserDetailsPayload) {
    const response = await apiClient.put(`/users/${userId}`, userDetails);
    return response.data;
  },
  

  async deleteUser(userId: number) {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    return await apiClient.patch(
      `/users/${userId}/change-password`,
      { currentPassword, newPassword } 
    );
}


};

export default userService;

