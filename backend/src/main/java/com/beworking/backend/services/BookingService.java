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

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public BookingCreatedResponse createBooking(User user, BookingRequest request) {
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

    public void deleteBooking(User user, Long bookingId) {
        // Find booking by ID and user ID using standard Spring Data JPA method
        Booking booking = bookingRepository.findByIdAndUser_Id(bookingId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Booking not found or you are not authorized to delete this booking"));
        
        bookingRepository.delete(booking);
    }

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
