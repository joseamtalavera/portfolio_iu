package com.beworking.backend.services;

import com.beworking.backend.dto.BookingCreatedResponse;
import com.beworking.backend.dto.BookingRequest;
import com.beworking.backend.dto.BookingResponse;
import com.beworking.backend.entities.Booking;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

/**
 * Booking service for creating, listing, and deleting bookings.
 */
@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    /**
     * Creates the service with required repository.
     *
     * @param bookingRepository booking repository
     */
    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Creates a new booking for a user.
     *
     * @param user current user
     * @param request booking request payload
     * @return created booking response
     * @throws ResponseStatusException when the period is invalid or already booked
     */
    public BookingCreatedResponse createBooking(User user, BookingRequest request) {
        // Bean Validation checks each field on its own; these two rules compare
        // fields against each other and against what is already stored.
        if (!request.endHour().isAfter(request.startHour())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End hour must be after start hour");
        }

        // Two periods overlap when each one starts before the other one ends.
        if (bookingRepository.existsByProductAndDateAndStartHourLessThanAndEndHourGreaterThan(
                request.product(), request.date(), request.endHour(), request.startHour())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That product is already booked for the requested period");
        }

        Booking booking = Booking.builder()
                .user(user)
                .product(request.product())
                .date(request.date())
                .startHour(request.startHour())
                .endHour(request.endHour())
                .attendees(request.attendees())
                .build();
        Booking saved = bookingRepository.save(booking);
        return new BookingCreatedResponse(saved.getId(), "Booking created successfully");
    }

    /**
     * Deletes a booking if it belongs to the given user.
     *
     * @param user current user
     * @param bookingId booking ID to delete
     * @throws ResponseStatusException when booking is not found or not owned by user
     */
    public void deleteBooking(User user, Long bookingId) {
        // Ownership is part of the WHERE clause, not an if-statement afterwards:
        // another user's booking is never loaded, so no code path can skip the check.
        Booking booking = bookingRepository.findByIdAndUser_Id(bookingId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Booking not found or you are not authorized to delete this booking"));
        
        bookingRepository.delete(booking);
    }

    /**
     * Lists all bookings for a user.
     *
     * @param user current user
     * @return list of bookings
     */
    public List<BookingResponse> listBookings(User user) {
        return bookingRepository.findAllByUser(user).stream()
                .map(b -> new BookingResponse(
                        b.getId(),
                        b.getProduct(),
                        b.getDate(),
                        b.getStartHour(),
                        b.getEndHour(),
                        b.getAttendees()
                ))
                .toList();
    }
}
