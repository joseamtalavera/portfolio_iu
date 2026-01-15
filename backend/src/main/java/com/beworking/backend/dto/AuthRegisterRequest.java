package com.beworking.backend.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registration request payload for a new user.
 *
 * @param name full name
 * @param email user email address
 * @param password user password
 */
public record AuthRegisterRequest( // record is a java feature for simple data-carrier classes
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6, max = 100) String password
){} 
