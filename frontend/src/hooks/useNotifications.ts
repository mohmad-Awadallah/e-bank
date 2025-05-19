// src/hooks/useNotifications.ts
import { useEffect, useState, useCallback } from 'react';
import { getDashboardNotifications, markNotificationAsRead } from '@/services/notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface UseNotificationsResult {
  notifications: Notification[];
  hasUnread: boolean;
  markAsRead: (id: string) => Promise<void>;
}

export function useNotifications(userId?: string): UseNotificationsResult {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getDashboardNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
    }
  }, [userId]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const hasUnread = notifications.some((n) => !n.isRead);

  return { notifications, hasUnread, markAsRead };
}
