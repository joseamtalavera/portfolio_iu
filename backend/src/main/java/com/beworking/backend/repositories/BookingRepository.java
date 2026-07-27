package com.beworking.backend.repositories;

import com.beworking.backend.entities.Booking;
import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for booking persistence and lookup operations.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {
    /**
     * Lists all bookings for a given user.
     *
     * @param user booking user
     * @return list of bookings
     */
    List<Booking> findAllByUser(User user);
    
    /**
     * Finds a booking by ID constrained to a specific user ID.
     *
     * @param id booking ID
     * @param userId user ID
     * @return optional booking
     */
    Optional<Booking> findByIdAndUser_Id(Long id, Long userId);

    /**
     * Checks whether an existing booking for the same product and date overlaps
     * the given period. Two periods overlap when each starts before the other ends.
     *
     * @param product product or resource name
     * @param date booking date
     * @param endHour end of the period being requested
     * @param startHour start of the period being requested
     * @return true when an overlapping booking already exists
     */
    boolean existsByProductAndDateAndStartHourLessThanAndEndHourGreaterThan(
            String product, LocalDate date, LocalTime endHour, LocalTime startHour);
}
