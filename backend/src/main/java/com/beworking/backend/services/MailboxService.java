package com.beworking.backend.services;

import com.beworking.backend.dto.MailboxItemResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.MailboxItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Mailbox service that maps mailbox entities to response DTOs.
 */
@Service 
public class MailboxService {

    private final MailboxItemRepository mailboxItemRepository;

    /**
     * Creates the service with required repository.
     *
     * @param mailboxItemRepository mailbox item repository
     */
    public MailboxService(MailboxItemRepository mailboxItemRepository) {
        this.mailboxItemRepository = mailboxItemRepository;
    }

    /**
     * Returns mailbox items for the given user.
     *
     * @param user current user
     * @return list of mailbox items
     */
    public List<MailboxItemResponse> getMailbox(User user) {
        return mailboxItemRepository.findAllByUser(user).stream()
                .map(item -> new MailboxItemResponse(
                        item.getId(),
                        item.getSubject(),
                        item.getMessage(),
                        item.getTimestamp(),
                        item.getPdfUrl()
                ))
                .toList();
    }
}
