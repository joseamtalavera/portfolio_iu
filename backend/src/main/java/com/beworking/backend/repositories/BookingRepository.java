package com.beworking.backend.repositories;

import com.beworking.backend.entities.Booking;
import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findAllByUser(User user);
    
    Optional<Booking> findByIdAndUser_Id(Long id, Long userId);
}