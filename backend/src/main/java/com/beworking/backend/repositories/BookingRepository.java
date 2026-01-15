package com.beworking.backend.repositories;

import com.beworking.backend.entities.Booking;
import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for booking persistence and lookup operations.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {
    /**
     * Lists all bookings for a given user.
     *
     * @param user owning user
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
}
