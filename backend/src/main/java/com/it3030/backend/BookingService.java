package com.it3030.backend;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private static final List<Booking.BookingStatus> BLOCKING_STATUSES = List.of(
        Booking.BookingStatus.PENDING,
        Booking.BookingStatus.APPROVED
    );

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Booking createBooking(Booking booking) {
        validateBookingTimeRange(booking);

        boolean hasConflict = hasSchedulingConflict(
            booking.getResourceId(),
            booking.getStartTime(),
            booking.getEndTime()
        );

        if (hasConflict) {
            throw new BookingConflictException("Scheduling conflict: Resource is already booked for the requested time range.");
        }

        if (booking.getStatus() == null) {
            booking.setStatus(Booking.BookingStatus.PENDING);
        }

        if (booking.getStatus() != Booking.BookingStatus.REJECTED) {
            booking.setRejectionReason(null);
        }

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "startTime"));
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    @Transactional
    public Booking updateStatus(Long id, Booking.BookingStatus status, String rejectionReason) {
        Booking existing = bookingRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (status == Booking.BookingStatus.REJECTED
            && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED.");
        }

        existing.setStatus(status);
        if (status == Booking.BookingStatus.REJECTED) {
            existing.setRejectionReason(rejectionReason);
        } else {
            existing.setRejectionReason(null);
        }

        Booking updated = bookingRepository.save(existing);

        if (status == Booking.BookingStatus.APPROVED) {
            notificationService.createNotification(
                updated.getUserId(),
                "Booking #" + updated.getId() + " has been APPROVED.",
                Notification.NotificationType.BOOKING
            );
        }

        if (status == Booking.BookingStatus.REJECTED) {
            String reasonPart = updated.getRejectionReason() == null || updated.getRejectionReason().isBlank()
                ? ""
                : " Reason: " + updated.getRejectionReason();

            notificationService.createNotification(
                updated.getUserId(),
                "Booking #" + updated.getId() + " has been REJECTED." + reasonPart,
                Notification.NotificationType.BOOKING
            );
        }

        return updated;
    }

    @Transactional(readOnly = true)
    public boolean hasSchedulingConflict(Long resourceId, java.time.LocalDateTime requestedStartTime,
                                         java.time.LocalDateTime requestedEndTime) {
        return bookingRepository.existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            resourceId,
            BLOCKING_STATUSES,
            requestedEndTime,
            requestedStartTime
        );
    }

    private void validateBookingTimeRange(Booking booking) {
        if (booking.getStartTime() == null || booking.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time are required.");
        }
        if (!booking.getEndTime().isAfter(booking.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
    }
}