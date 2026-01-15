package com.beworking.backend.controllers;

import com.beworking.backend.entities.User;
import com.beworking.backend.services.SubscriptionService;
import com.beworking.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Subscription endpoints for Stripe checkout and webhooks.
 */
@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserService userService;

    /**
     * Creates the controller with required services.
     *
     * @param subscriptionService subscription service
     * @param userService user service
     */
    public SubscriptionController(SubscriptionService subscriptionService, UserService userService) {
        this.subscriptionService = subscriptionService;
        this.userService = userService;
    }

    /**
     * Creates a Stripe checkout session for the authenticated user.
     *
     * @return JSON payload containing the Stripe checkout URL
     */
    @PostMapping("/create-checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession() {
        User user = userService.getCurrentUser();
        String checkoutUrl = subscriptionService.createCheckoutSession(user);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    /**
     * Handles Stripe webhook events (public endpoint).
     *
     * @param payload request body containing the webhook payload
     * @param stripeSignature Stripe signature header
     * @return success response when processed
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String stripeSignature) {
        subscriptionService.handleWebhook(payload, stripeSignature);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}
