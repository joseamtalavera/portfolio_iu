package com.beworking.backend.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Profile update request payload for user profile fields.
 *
 * @param name full name (required)
 * @param phone phone number (optional)
 * @param company company name (optional)
 * @param billingAddress billing address (optional)
 * @param billingCity billing city (optional)
 * @param billingCountry billing country (optional)
 * @param billingPostalCode billing postal code (optional)
 */
public record ProfileUpdateRequest(
    @NotBlank (message = "Name is required")
    String name,

    // these fields can be null
    String phone, 
    String company, 
    String billingAddress, 
    String billingCity,
    String billingCountry,
    String billingPostalCode
) {}
    
