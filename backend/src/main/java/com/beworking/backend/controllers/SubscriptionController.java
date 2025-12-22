package com.beworking.backend.controllers;

import com.beworking.backend.entities.User;
import com.beworking.backend.services.SubscriptionService;
import com.beworking.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    public SubscriptionController(SubscriptionService subscriptionService, UserService userService) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
    }

    /**
     * Creates a Stripe checkout session for the authenticated user
     * @return The URL to the Stripe checkout page
     */
    @PostMapping("/create-checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession() {
        User user = userService.getCurrentUser();
        String checkoutUrl = subscriptionService.createCheckoutSession(user);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    /**
     * Webhook endpoint for Stripe webhooks. Sending events from Stripe to our server
     * This endpoint is public and can be accessed by anyone. (not authenticated)
     * @param payload request body containing the payload 
     * @param stripeSignature header containing the Stripe signature
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String stripeSignature) {
        subscriptionService.handleWebhook(payload, stripeSignature);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}
