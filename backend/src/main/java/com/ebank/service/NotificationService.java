package com.ebank.service;

import com.ebank.model.notification.Notification;
import com.ebank.model.notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    Notification sendNotification(Long userId, String title,
                                  String message, NotificationType type);

    Notification markAsRead(Long notificationId);

    void deleteNotification(Long notificationId);

    Notification getNotificationById(Long notificationId);

    Page<Notification> getUserNotifications(Long userId, Pageable pageable);

    List<Notification> getUnreadNotifications(Long userId);

    List<Notification> getNotificationsByType(Long userId, NotificationType type);

    void markAllAsRead(Long userId);

    int getUnreadCount(Long userId);

    Notification updateNotification(Notification notification);

}