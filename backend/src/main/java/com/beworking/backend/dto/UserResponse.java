package com.beworking.backend.dto;

public record UserResponse(
    Long id,
    String name,
    String email,
    // fields for stripe integration
    String phone, 
    String company, 
    String billingAddress, 
    String billingCity,
    String billingCountry,
    String billingPostalCode
) {}