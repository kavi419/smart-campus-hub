package com.it3030.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId,
                                                                      Authentication authentication) {
        Long requesterUserId = parseAuthenticatedUserId(authentication);
        boolean isAdmin = hasAdminRole(authentication);

        if (!isAdmin && !requesterUserId.equals(userId)) {
            throw new IllegalArgumentException("You can only view your own notifications.");
        }

        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id,
                                                   Authentication authentication) {
        Long requesterUserId = parseAuthenticatedUserId(authentication);
        boolean isAdmin = hasAdminRole(authentication);

        Notification updated = notificationService.markAsRead(id, requesterUserId, isAdmin);
        return ResponseEntity.ok(updated);
    }

    private Long parseAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }

        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid authenticated user id.");
        }
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch("ROLE_ADMIN"::equals);
    }
}
