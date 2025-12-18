package com.beworking.backend.entities;

import jakarta.persistence.*;
import lombok.*;

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
}