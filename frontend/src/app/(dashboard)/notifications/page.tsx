// src/app/(dashboard)/notifications/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { getDashboardNotifications, markNotificationAsRead } from '@/services/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (isAuthenticated && user) {
      try {
        const data = await getDashboardNotifications(user.id);
        setNotifications(data);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>
        <p>You must be logged in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Notifications</h1>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500">You have no notifications.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className={`p-4 border rounded-lg shadow-sm cursor-pointer transition ${
                notification.isRead ? 'bg-white' : 'bg-gray-100'
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-sm text-gray-700">{notification.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(notification.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPage;
