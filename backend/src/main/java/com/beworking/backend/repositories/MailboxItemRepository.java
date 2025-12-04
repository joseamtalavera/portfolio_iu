package com.beworking.backend.repositories;

import com.beworking.backend.entities.MailboxItem;
import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MailboxItemRepository extends JpaRepository<MailboxItem, Long> { // Long is the type of the primary key
    List<MailboxItem> findAllByUser(User user);
}