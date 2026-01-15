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

    @Column(nullable = false)
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

    // Fields for Stripe integration
    private String phone;
    
    private String company;

    private String billingAddress;
    private String billingCity;

    private String billingCountry;

    private String billingPostalCode;
}
