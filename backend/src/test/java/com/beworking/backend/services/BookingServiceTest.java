package com.beworking.backend.services;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.beworking.backend.dto.BookingRequest;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.BookingRepository;

import com.beworking.backend.entities.Booking;
import com.beworking.backend.dto.BookingCreatedResponse;

import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    @DisplayName("create rejects an end hour that is before the start hour")
    void createRejectsEndBeforeStart(){ // TEST_PLAN B1
        // arrange - an obviously invalid period
        User user = User.builder().id(1L).build();
        BookingRequest request = new BookingRequest(
            "Meeting Room A", LocalDate.now().plusDays(1), LocalTime.of(17, 0), LocalTime.of(9, 0), 4);

        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class,
            () -> bookingService.createBooking(user, request));
        
        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("create rejects a start hour equal to the end hour")
    void createRejectsEqualStartAndEnd(){ // TEST_PLAN B2
        User user = User.builder().id(1L).build();
        BookingRequest request = new BookingRequest(
            "Meeting Room A", LocalDate.now().plusDays(1), LocalTime.of(9,0), LocalTime.of(9,0),4);

        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class,
            ()-> bookingService.createBooking(user, request));

        assertEquals(HttpStatus.BAD_REQUEST, thrown.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("create rejects a booking that overlaps an existing one")
    void createRejectsOverlap(){ // TEST_PLAN B3
        User user = User.builder().id(1L).build();
        BookingRequest request = new BookingRequest(
            "Meeting Room A", LocalDate.now().plusDays(1), LocalTime.of(9,0), LocalTime.of(11,0), 4);

        when(bookingRepository.existsByProductAndDateAndStartHourLessThanAndEndHourGreaterThan(
            any(),any(), any(), any())).thenReturn(true);

        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class, 
            () -> bookingService.createBooking(user, request));

        assertEquals(HttpStatus.CONFLICT, thrown.getStatusCode());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("create saves the booking and returns its id when the slot is free")
    void createSavesWhenSlotIsFree(){ // TEST_PLAN B4
        User user = User.builder().id(1L).build();
        BookingRequest request = new BookingRequest(
            "Meeting Room A", LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0), 4);

        Booking saved = Booking.builder().id(42L).build();
        when(bookingRepository.save(any())).thenReturn(saved);

        BookingCreatedResponse response = bookingService.createBooking(user, request);

        assertEquals(42L, response.id());
    }

    @Test
    @DisplayName("create attaches the caller from the token as the booking owner")
    void createAttachesCallerOwner(){ // TEST_PLAN B5
        User caller = User.builder().id(7L).build();
        BookingRequest request = new BookingRequest(
            "Meeting Room A", LocalDate.now().plusDays(1), LocalTime.of(9, 0), LocalTime.of(11, 0), 4);

        when(bookingRepository.save(any())).thenReturn(Booking.builder().id(42L).build());

        bookingService.createBooking(caller, request);

        ArgumentCaptor<Booking> captor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(captor.capture());
        assertEquals(7L, captor.getValue().getUser().getId());
    }

    @Test
    @DisplayName("delete refuses a booking owned by someone else")
    void deleteRefusesBookingOwnedBySomeoneElse(){ // TEST_PLAN B6
        User caller = User.builder().id(7L).build();

        ResponseStatusException thrown = assertThrows(
            ResponseStatusException.class, 
        () -> bookingService.deleteBooking(caller, 42L));

        assertEquals(HttpStatus.FORBIDDEN, thrown.getStatusCode());
        verify(bookingRepository, never()).delete(any());
    }

    @Test 
    @DisplayName("delete removes a booking the caller owns")
    void deleteRemovesOwnBooking(){ // TEST_PLAN B7
        User caller = User.builder().id(7L).build();
        Booking booking = Booking.builder().id(42L).build();
        when(bookingRepository.findByIdAndUser_Id(42L, 7L)).thenReturn(Optional.of(booking));

        bookingService.deleteBooking(caller, 42L);

        verify(bookingRepository).delete(booking);
    }

    @Test
    @DisplayName("delete scopes the lookup by both booking id and caller id")
    void deleteScopesLookupByCallerId(){ // TEST_PLAN B8
        User caller = User.builder().id(7L).build();
        Booking booking = Booking.builder().id(42L).build();
        when(bookingRepository.findByIdAndUser_Id(42L, 7L)).thenReturn(Optional.of(booking));

        bookingService.deleteBooking(caller, 42L);

        verify(bookingRepository).findByIdAndUser_Id(42L, 7L);
    }
}