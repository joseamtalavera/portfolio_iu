package com.beworking.backend.dto;

import java.time.LocalDateTime;

public record MailboxItemResponse(
    Long id, 
    String subject,
    String message,
    LocalDateTime timestamp
) {}