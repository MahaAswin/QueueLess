package com.queueless.backend.notification;

import com.queueless.backend.common.NotificationNotFoundException;
import com.queueless.backend.notification.dto.NotificationPageResponse;
import com.queueless.backend.notification.dto.NotificationResponse;
import com.queueless.backend.notification.dto.UnreadCountResponse;
import com.queueless.backend.user.User;
import com.queueless.backend.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(User recipient, NotificationType type, String title, String message, UUID relatedOrderId, UUID relatedShopId) {
        if (recipient == null) {
            return;
        }

        Notification notification = Notification.builder()
                .recipient(recipient)
                .type(type)
                .title(title)
                .message(message)
                .relatedOrderId(relatedOrderId)
                .relatedShopId(relatedShopId)
                .read(false)
                .build();

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationPageResponse getUserNotifications(String email, int page, int size) {
        User recipient = getUserByEmail(email);

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> notificationPage = notificationRepository.findByRecipient(recipient, pageRequest);

        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return NotificationPageResponse.builder()
                .content(content)
                .page(notificationPage.getNumber())
                .size(notificationPage.getSize())
                .totalElements(notificationPage.getTotalElements())
                .totalPages(notificationPage.getTotalPages())
                .hasNext(notificationPage.hasNext())
                .build();
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse getUnreadCount(String email) {
        User recipient = getUserByEmail(email);
        long count = notificationRepository.countByRecipientAndReadFalse(recipient);
        return new UnreadCountResponse(count);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, String email) {
        User recipient = getUserByEmail(email);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new AccessDeniedException("You are not authorized to access this notification");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.fromEntity(notification);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User recipient = getUserByEmail(email);
        List<Notification> unreadList = notificationRepository.findByRecipientAndReadFalse(recipient);
        LocalDateTime now = LocalDateTime.now();
        for (Notification notification : unreadList) {
            notification.setRead(true);
            notification.setReadAt(now);
        }
        notificationRepository.saveAll(unreadList);
    }

    @Transactional
    public void deleteNotification(UUID notificationId, String email) {
        User recipient = getUserByEmail(email);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with ID: " + notificationId));

        if (!notification.getRecipient().getId().equals(recipient.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
