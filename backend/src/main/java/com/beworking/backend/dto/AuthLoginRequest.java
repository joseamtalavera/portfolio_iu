package com.beworking.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Login request payload containing user credentials.
 *
 * @param email user email address
 * @param password user password
 */
public record AuthLoginRequest(
    @NotBlank @Email String email, 
    @NotBlank String password
) {}
