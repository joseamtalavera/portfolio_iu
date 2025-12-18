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

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingCreatedResponse createBooking(@Valid @RequestBody BookingRequest request) {
        User user = userService.getCurrentUser();
        return bookingService.createBooking(user, request);
    }

    @GetMapping
    public List<BookingResponse> getBookings() {
        User user = userService.getCurrentUser();
        return bookingService.listBookings(user);
    }

    @DeleteMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable Long bookingId) {
        User user = userService.getCurrentUser();
        bookingService.deleteBooking(user, bookingId);
    }
}
