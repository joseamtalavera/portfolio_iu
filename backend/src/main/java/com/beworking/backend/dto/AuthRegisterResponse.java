package com.beworking.backend.dto;

/**
 * Registration response with a message and created user ID.
 *
 * @param message status message
 * @param userId created user ID
 */
public record AuthRegisterResponse(
    String message,
    Long userId
){}
