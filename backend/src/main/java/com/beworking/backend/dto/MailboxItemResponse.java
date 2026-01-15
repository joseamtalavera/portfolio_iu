package com.beworking.backend.dto;

import java.time.LocalDateTime;

/**
 * Mailbox item response payload for API consumers.
 *
 * @param id mailbox item ID
 * @param subject subject line
 * @param message message body
 * @param timestamp creation timestamp
 * @param pdfUrl optional PDF URL
 */
public record MailboxItemResponse(
    Long id, 
    String subject,
    String message,
    LocalDateTime timestamp,
    String pdfUrl
) {}
