package com.beworking.backend.dto;

public record UserResponse(
    Long id,
    String name,
    String email
) {}