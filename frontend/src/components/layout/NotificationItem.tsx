// src/components/layout/NotificationItem.tsx
import React from 'react';
import { Notification } from '@/hooks/useNotifications';

export interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  return (
    <li
      role="menuitem"
      onClick={() => onClick(notification)}
      className={`border p-3 rounded cursor-pointer hover:bg-gray-50 ${
        notification.isRead ? '' : 'bg-gray-100'
      }`}
      data-testid={`notification-${notification.id}`}
    >
      <strong className="block">{notification.title}</strong>
      <p className="text-sm text-gray-700">{notification.message}</p>
      <span className="text-xs text-gray-400">
        {new Date(notification.createdAt).toLocaleString()}
      </span>
    </li>
  );
};

export default React.memo(NotificationItem);
