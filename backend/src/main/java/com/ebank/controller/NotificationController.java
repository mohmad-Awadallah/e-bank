package com.ebank.controller;

import com.ebank.model.notification.Notification;
import com.ebank.model.notification.NotificationType;
import com.ebank.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for managing user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(
            summary = "Send notification",
            description = "Send a new notification to user",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Notification sent"),
                    @ApiResponse(responseCode = "400", description = "Invalid content"),
                    @ApiResponse(responseCode = "404", description = "User not found")
            }
    )
    @PostMapping
    public ResponseEntity<Notification> sendNotification(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam NotificationType type
    ) {
        Notification notification = notificationService.sendNotification(userId, title, message, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    @Operation(
            summary = "Mark notification as read",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Notification marked as read"),
                    @ApiResponse(responseCode = "404", description = "Notification not found")
            }
    )
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long notificationId
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @Operation(
            summary = "Delete notification",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Notification deleted"),
                    @ApiResponse(responseCode = "404", description = "Notification not found")
            }
    )
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long notificationId
    ) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get notification by ID")
    @GetMapping("/{notificationId}")
    public ResponseEntity<Notification> getNotificationById(
            @PathVariable Long notificationId
    ) {
        return ResponseEntity.ok(notificationService.getNotificationById(notificationId));
    }

    @Operation(summary = "Get user notifications (paginated)")
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Notification>> getUserNotifications(
            @PathVariable Long userId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId, pageable));
    }

    @Operation(summary = "Get unread notifications")
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @Operation(summary = "Mark all notifications as read")
    @PatchMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Long userId
    ) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get notifications by type")
    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<Notification>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable NotificationType type
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(userId, type));
    }

    @Operation(summary = "Get unread notifications count")
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Integer> getUnreadCount(
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @Operation(
            summary = "Update notification message",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Message updated"),
                    @ApiResponse(responseCode = "400", description = "Invalid content"),
                    @ApiResponse(responseCode = "404", description = "Notification not found")
            }
    )
    @PatchMapping("/{notificationId}/message")
    public ResponseEntity<Notification> updateMessage(
            @PathVariable Long notificationId,
            @RequestParam String newMessage
    ) {
        Notification notification = notificationService.getNotificationById(notificationId);
        notification.setMessage(newMessage);
        return ResponseEntity.ok(notificationService.updateNotification(notification));
    }
}