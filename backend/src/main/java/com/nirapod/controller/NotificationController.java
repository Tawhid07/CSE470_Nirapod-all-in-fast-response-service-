package com.nirapod.controller;

import com.nirapod.model.Notification;
import com.nirapod.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/comments")
    public ResponseEntity<List<Notification>> getCommentNotifications(@PathVariable String userId) {
        List<Notification> allNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Notification> commentNotifications = allNotifications.stream()
            .filter(n -> n.getMessage().contains("commented on"))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(commentNotifications);
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId) {
        long count = notificationRepository.countByUserIdAndReadFalse(userId);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id)
            .map(notification -> {
                notification.setRead(true);
                notificationRepository.save(notification);
                return ResponseEntity.ok().build();
            })
            .orElse(ResponseEntity.notFound().build());
    }
}