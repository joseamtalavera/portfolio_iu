package com.beworking.backend.services;

import com.beworking.backend.dto.MailboxItemResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.MailboxItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

// Fetches mailbox items for a user and maps them to response DTOs
@Service 
public class MailboxService {

    private final MailboxItemRepository mailboxItemRepository;

    public MailboxService(MailboxItemRepository mailboxItemRepository) {
        this.mailboxItemRepository = mailboxItemRepository;
    }

    public List<MailboxItemResponse> getMailbox(User user) {
        return mailboxItemRepository.findAllByUser(user).stream()
                .map(item -> new MailboxItemResponse(
                        item.getId(),
                        item.getSubject(),
                        item.getMessage(),
                        item.getTimestamp()
                ))
                .toList();
    }
}