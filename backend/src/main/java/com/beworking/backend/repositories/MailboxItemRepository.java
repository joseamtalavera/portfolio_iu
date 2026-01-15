package com.beworking.backend.repositories;

import com.beworking.backend.entities.MailboxItem;
import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for mailbox item persistence and lookup operations.
 */
public interface MailboxItemRepository extends JpaRepository<MailboxItem, Long> {
    /**
     * Lists all mailbox items for a given user.
     *
     * @param user owning user
     * @return list of mailbox items
     */
    List<MailboxItem> findAllByUser(User user);
}
