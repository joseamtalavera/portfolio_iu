package com.beworking.backend.dto;

/**
 * User profile response payload for API consumers.
 *
 * @param id user ID
 * @param name full name
 * @param email user email
 * @param phone phone number (optional)
 * @param company company name (optional)
 * @param billingAddress billing address (optional)
 * @param billingCity billing city (optional)
 * @param billingCountry billing country (optional)
 * @param billingPostalCode billing postal code (optional)
 * @param subscriptionStatus subscription status string
 */
public record UserResponse(
    Long id,
    String name,
    String email,
    // Optional profile fields, shown on the account page.
    String phone,
    String company,

    // Billing address, collected for Stripe checkout.
    String billingAddress,
    String billingCity,
    String billingCountry,
    String billingPostalCode,
    String subscriptionStatus
) {}
