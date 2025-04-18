package com.ebank.service.impl;

import com.ebank.exception.NotificationException;
import com.ebank.model.notification.Notification;
import com.ebank.model.notification.NotificationType;
import com.ebank.model.user.User;
import com.ebank.repository.NotificationRepository;
import com.ebank.repository.UserRepository;
import com.ebank.service.CacheService;
import com.ebank.service.NotificationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CacheService cacheService;

    @Override
    @Transactional
    public Notification sendNotification(Long userId, String title,
                                         String message, NotificationType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotificationException("User not found"));

        validateNotificationContent(title, message);

        Notification notification = Notification.builder()
                .recipient(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        log.info("Sent {} notification to user {}: {}", type, userId, title);
        return savedNotification;
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        log.info("Marked notification {} as read", notificationId);
        return updatedNotification;
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        Notification notification = getNotificationById(notificationId);
        notificationRepository.delete(notification);
        log.info("Deleted notification: {}", notificationId);
    }

    @Override
    public Notification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationException("Notification not found"));
    }

    @Override
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        String cacheKey = "notifications:all:" + userId + ":" + pageable.getPageNumber();
        Page<Notification> cached = cacheService.getCachedData(cacheKey, Page.class);

        if (cached != null) return cached;

        Page<Notification> notifications = notificationRepository
                .findByRecipient_IdOrderByCreatedAtDesc(userId, pageable);

        cacheService.cacheData(cacheKey, notifications, Page.class);
        cacheService.setExpiration(cacheKey, 30, TimeUnit.MINUTES);

        return notifications;
    }

    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        String cacheKey = "notifications:unread:" + userId;
        List<Notification> cached = cacheService.getCachedData(cacheKey, List.class);

        if (cached != null) return cached;

        List<Notification> notifications = notificationRepository
                .findByRecipient_IdAndIsReadFalseOrderByCreatedAtDesc(userId);

        cacheService.cacheData(cacheKey, notifications, List.class);
        cacheService.setExpiration(cacheKey, 10, TimeUnit.MINUTES);

        return notifications;
    }

    @Override
    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        return notificationRepository.findByRecipient_IdAndTypeOrderByCreatedAtDesc(userId, type);
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
        log.info("Marked all notifications as read for user: {}", userId);
    }

    @Override
    public int getUnreadCount(Long userId) {
        return notificationRepository.countByRecipient_IdAndIsReadFalse(userId);
    }

    @Override
    public Notification updateNotification(Notification notification) {
        Notification existing = getNotificationById(notification.getId());
        existing.setMessage(notification.getMessage());
        return notificationRepository.save(existing);
    }

    private void validateNotificationContent(String title, String message) {
        if (title == null || title.trim().isEmpty()) {
            throw new NotificationException("Notification title cannot be empty");
        }

        if (message == null || message.trim().isEmpty()) {
            throw new NotificationException("Notification message cannot be empty");
        }

        if (title.length() > 100) {
            throw new NotificationException("Notification title too long");
        }

        if (message.length() > 1000) {
            throw new NotificationException("Notification message too long");
        }
    }
}