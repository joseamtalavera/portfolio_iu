package com.beworking.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * JPA entity representing an application user and related subscription profile fields.
 */
@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // database's auto increment feature to generate primary keys
    private Long id;

    // length mirrors @Size(max = 100) on AuthRegisterRequest so DTO and schema agree.
    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Subscription fields
    @Builder.Default
    private String subscriptionStatus = "INACTIVE";

    private String stripeCustomerId;

    private String stripeSubscriptionId;

    private LocalDateTime subscriptionStartDate;

    private LocalDateTime subscriptionEndDate;

    // Optional profile fields, shown on the account page.
    private String phone;

    private String company;

    // Billing address, sent to Stripe at checkout.
    private String billingAddress;
    
    private String billingCity;

    private String billingCountry;

    private String billingPostalCode;
}
