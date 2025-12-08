package com.beworking.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String product;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime startHour;

    @Column(nullable = false)
    private LocalTime endHour;

    @Column(nullable = false)
    private Integer attendees;

}