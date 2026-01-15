package com.beworking.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Booking creation request payload.
 *
 * @param product product or resource name
 * @param date booking date (today or future)
 * @param startHour booking start time
 * @param endHour booking end time
 * @param attendees number of attendees
 */
public record BookingRequest(
        @NotBlank String product,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime startHour,
        @NotNull LocalTime endHour,
        @NotNull @Min(1) Integer attendees
) { }
