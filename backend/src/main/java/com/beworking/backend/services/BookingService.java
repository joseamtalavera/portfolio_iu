package com.beworking.backend.services;

import com.beworking.backend.dto.BookingCreatedResponse;
import com.beworking.backend.dto.BookingRequest;
import com.beworking.backend.dto.BookingResponse;
import com.beworking.backend.entities.Booking;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.BookingRepository;
import org.springframework.stereotype.Service;

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
