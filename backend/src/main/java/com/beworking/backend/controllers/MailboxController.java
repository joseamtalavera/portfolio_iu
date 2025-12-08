package com.beworking.backend.controllers;

import com.beworking.backend.dto.MailboxItemResponse;
import com.beworking.backend.entities.User;
import com.beworking.backend.services.MailboxService;
import com.beworking.backend.services.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;



@RestController
@RequestMapping("/api/mailbox")
public class MailboxController {
    
    private final MailboxService mailboxService;
    private final UserService userService;

    
    public MailboxController(MailboxService mailboxService, UserService userService) {
        this.mailboxService = mailboxService;
        this.userService = userService;
    }

    // 
    @GetMapping // Endpoint to retrieve mailbox items for the authenticated user.
    public List<MailboxItemResponse> getCurrentUser() {
        User user = userService.getCurrentUser();
        return mailboxService.getMailbox(user);
    }
    
}