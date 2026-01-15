package com.beworking.backend.controllers;

import com.beworking.backend.dto.BookingCreatedResponse;
import com.beworking.backend.dto.BookingRequest;
import com.beworking.backend.dto.BookingResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.services.BookingService;
import com.beworking.backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Booking endpoints for the authenticated user.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    /**
     * Creates the controller with required services.
     *
     * @param bookingService booking service
     * @param userService user service
     */
    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    /**
     * Creates a booking for the current user.
     *
     * @param request booking request payload
     * @return created booking response
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingCreatedResponse createBooking(@Valid @RequestBody BookingRequest request) {
        User user = userService.getCurrentUser();
        return bookingService.createBooking(user, request);
    }

    /**
     * Lists bookings for the current user.
     *
     * @return list of bookings
     */
    @GetMapping
    public List<BookingResponse> getBookings() {
        User user = userService.getCurrentUser();
        return bookingService.listBookings(user);
    }

    /**
     * Deletes a booking for the current user.
     *
     * @param bookingId booking ID to delete
     */
    @DeleteMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable Long bookingId) {
        User user = userService.getCurrentUser();
        bookingService.deleteBooking(user, bookingId);
    }
}
