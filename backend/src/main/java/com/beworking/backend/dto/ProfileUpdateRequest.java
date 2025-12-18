package com.beworking.backend.dto;

import jakarta.validation.constraints.NotBlank;

// this will be the dto to update the user profile
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
    

