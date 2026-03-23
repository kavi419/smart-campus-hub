package com.it3030.backend;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId,
                                                                      Authentication authentication) {
        Long requesterUserId = parseAuthenticatedUserId(authentication);
        System.out.println("Requested ID: " + userId + ", Authenticated ID: " + requesterUserId);
        boolean isAdmin = hasAdminRole(authentication);

        if (!isAdmin && !requesterUserId.equals(userId)) {
            throw new IllegalArgumentException("You can only view your own notifications.");
        }

        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id,
                                                   Authentication authentication) {
        Long requesterUserId = parseAuthenticatedUserId(authentication);
        boolean isAdmin = hasAdminRole(authentication);

        Notification updated = notificationService.markAsRead(id, requesterUserId, isAdmin);
        return ResponseEntity.ok(updated);
    }

    private Long parseAuthenticatedUserId(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalArgumentException("Authenticated user is required.");
        }

        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            System.out.println("OAuth2 Attributes: " + oauth2User.getAttributes());
            Object appUserId = oauth2User.getAttribute("appUserId");
            if (appUserId != null) {
                if (appUserId instanceof Long) {
                    return (Long) appUserId;
                } else {
                     try {
                        return Long.valueOf(appUserId.toString());
                    } catch (NumberFormatException ignored) {
                        // fallback
                    }
                }
            }
        }
        
        if (authentication.getName() == null) {
             throw new IllegalArgumentException("Authenticated user name is null.");
        }

        try {
            return Long.valueOf(authentication.getName());
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid authenticated user id: " + authentication.getName());
        }
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch("ROLE_ADMIN"::equals);
    }
}
