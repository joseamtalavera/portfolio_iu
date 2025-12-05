package com.beworking.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotBlank String product,
        @NotNull @FutureOrPresent LocalDate date,
        @NotNull LocalTime startHour,
        @NotNull LocalTime endHour,
        @NotNull @Min(1) Integer attendees
) { }
