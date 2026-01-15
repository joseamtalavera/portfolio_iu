package com.beworking.backend.dto;

/**
 * Login response containing JWT and user profile summary.
 *
 * @param token JWT token for authenticated requests
 * @param user user profile summary
 */
public record AuthLoginResponse(
    String token,
    UserResponse user
) {}
