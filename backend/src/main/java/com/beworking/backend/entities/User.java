package com.beworking.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Subscription fields
    @Column(nullable = false, columnDefinition = "varchar(255) default 'INACTIVE'")
    @Builder.Default
    private String subscriptionStatus = "INACTIVE"; // INACTIVE, ACTIVE, CANCELLED, EXPIRED, These are the only valid values for the subscription status.

    @Column(nullable = true)
    private String stripeCustomerId;

    @Column(nullable = true)
    private String stripeSubscriptionId;

    @Column(nullable = true)
    private LocalDateTime subscriptionStartDate;

    @Column(nullable = true)
    private LocalDateTime subscriptionEndDate;


    // Fields for Stripe integration
    @Column(nullable = true)
    private String phone;
    
    @Column(nullable = true)
    private String company;

    @Column(nullable = true)
    private String billingAddress;
    @Column(nullable = true) 
    private String billingCity;

    @Column(nullable = true)
    private String billingCountry;

    @Column(nullable = true)    
    private String billingPostalCode;

    @PrePersist
    void ensureSubscriptionStatus() {
        if (subscriptionStatus == null) {
            subscriptionStatus = "INACTIVE";
        }
    }
}
