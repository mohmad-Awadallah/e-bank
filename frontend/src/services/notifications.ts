// src/services/notifications.ts

import apiClient from '@/lib/apiClient';


export enum NotificationType {
  TRANSACTION = "TRANSACTION",
  SECURITY = "SECURITY",
  PROMOTION = "PROMOTION",
  SYSTEM = "SYSTEM",
  ACCOUNT_ALERT = "ACCOUNT_ALERT",
}
export interface UserBrief {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Notification {
  id: number;
  recipient: UserBrief;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO date string
}
export async function getDashboardNotifications(userId: string) {
    const res = await apiClient.get(`/notifications/user/${userId}`);
    return res.data.content; 
  }
  
  export async function markNotificationAsRead(notificationId: string) {
    await apiClient.patch(`/notifications/${notificationId}/read`);
  }



  enum SortOrder { ASC = 'asc', DESC = 'desc' }
export interface FetchNotificationsParams {
  userId: string;
  page?: number;
  size?: number;
  sort?: string; // e.g. 'createdAt,desc'
}


// Fetch unread notifications for a user
export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const res = await apiClient.get(`/notifications/user/${userId}/unread`);
  return res.data;
}

// Get a single notification by ID
export async function getNotificationById(notificationId: string): Promise<Notification> {
  const res = await apiClient.get(`/notifications/${notificationId}`);
  return res.data;
}

// Send a new notification
type SendNotificationParams = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
};
export async function sendNotification({ userId, title, message, type }: SendNotificationParams): Promise<Notification> {
  const res = await apiClient.post('/notifications', null, {
    params: { userId, title, message, type }
  });
  return res.data;
}
 // Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await apiClient.patch(`/notifications/user/${userId}/mark-all-read`);
}

// Delete a notification by ID
export async function deleteNotification(notificationId: string): Promise<void> {
  await apiClient.delete(`/notifications/${notificationId}`);
}

// Get notifications by type for a user
export async function getNotificationsByType(userId: string, type: NotificationType): Promise<Notification[]> {
  const res = await apiClient.get(`/notifications/user/${userId}/type/${type}`);
  return res.data;
}

// Get unread notifications count for a user
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const res = await apiClient.get(`/notifications/user/${userId}/unread-count`);
  return res.data;
}

// Update the message of a notification
export async function updateNotificationMessage(notificationId: string, newMessage: string): Promise<Notification> {
  const res = await apiClient.patch(`/notifications/${notificationId}/message`, null, {
    params: { newMessage }
  });
  return res.data;
}
