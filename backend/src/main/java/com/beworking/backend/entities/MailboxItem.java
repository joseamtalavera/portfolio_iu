package com.beworking.backend.entities;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "mailbox_items")
@Getter
@Setter
@NoArgsConstructor //reates a no-argument constructor (needed by JPA).
@AllArgsConstructor // Creates a constructor with 1 parameter for each field in your class.
@Builder
public class MailboxItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false) // Many mailbox items can belong to one user
    @JoinColumn(name = "user_id", nullable = false) // Foreign key stored in this column
    private User user;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = true)
    private String pdfUrl;
}