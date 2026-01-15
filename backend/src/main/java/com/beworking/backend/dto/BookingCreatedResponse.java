package com.beworking.backend.dto;

/**
 * Response returned after a booking is created.
 *
 * @param id booking ID
 * @param message status message
 */
public record BookingCreatedResponse(Long id, String message) { }
