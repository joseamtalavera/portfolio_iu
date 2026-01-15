package com.beworking.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Booking response payload for API consumers.
 *
 * @param id booking ID
 * @param product product or resource name
 * @param date booking date
 * @param startHour booking start time
 * @param endHour booking end time
 * @param attendees number of attendees
 */
public record BookingResponse(
    Long id, 
    String product,
    LocalDate date,
    LocalTime startHour, 
    LocalTime endHour, 
    Integer attendees
){}
