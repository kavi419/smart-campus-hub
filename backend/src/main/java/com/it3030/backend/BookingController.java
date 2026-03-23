package com.it3030.backend;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody Booking booking,
                                                 Authentication authentication) {
        booking.setUserId(parseAuthenticatedUserId(authentication));
        Booking created = bookingService.createBooking(booking);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUser(@PathVariable Long userId,
                                                           Authentication authentication) {
        Long authenticatedUserId = parseAuthenticatedUserId(authentication);
        System.out.println("Requested ID: " + userId + ", Authenticated ID: " + authenticatedUserId);
        if (!isAdmin(authentication) && !authenticatedUserId.equals(userId)) {
            throw new IllegalArgumentException("You can only view your own bookings.");
        }
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id,
                                                       @Valid @RequestBody BookingStatusUpdateRequest request) {
        if (request.getStatus() != Booking.BookingStatus.APPROVED
            && request.getStatus() != Booking.BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Status update endpoint only supports APPROVED or REJECTED.");
        }

        Booking updated = bookingService.updateStatus(id, request.getStatus(), request.getRejectionReason());
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

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .anyMatch("ROLE_ADMIN"::equals);
    }
}