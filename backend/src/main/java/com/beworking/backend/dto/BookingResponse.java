package com.beworking.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
    Long id, 
    String product,
    LocalDate date,
    LocalTime startHour, 
    LocalTime endHour, 
    Integer attendes
){}

