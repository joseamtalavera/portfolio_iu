package com.beworking.backend.dto;

public record AuthLoginResponse(
    String token,
    UserResponse user
) {}