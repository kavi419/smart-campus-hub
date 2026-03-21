package com.it3030.backend;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    boolean existsByResourceIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
        Long resourceId,
        List<Booking.BookingStatus> statuses,
        LocalDateTime requestedEndTime,
        LocalDateTime requestedStartTime
    );
}