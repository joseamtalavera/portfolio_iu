package com.beworking.backend.services;

import com.beworking.backend.entities.User;
import com.beworking.backend.repositories.UserRepository;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.Subscription;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@Service
public class SubscriptionService {

    private final UserRepository userRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.price-id:}")
    private String priceId;

    @Value("${stripe.success-url:http://localhost:3000/subscription/success}")
    private String successUrl;
    
    @Value("${stripe.cancel-url:http://localhost:3000/subscription/cancel}")
    private String cancelUrl;

    public SubscriptionService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    /**
     * Creates a stripe checkout session for the user
     * @param user The user requesting the subscription
     * @return The URL to the stripe checkout page
     */

    public String createCheckoutSession(User user) {
        if (stripeSecretKey == null || stripeSecretKey.isEmpty() || 
            priceId == null || priceId.isEmpty()) {
            throw new ResponseStatusException(
                INTERNAL_SERVER_ERROR,
                "Stripe configuration is missing. Please configure stripe.secret-key and stripe.price-id in application.properties"
            );
        }
        
        try {
            // Initialize Stripe
            Stripe.apiKey = stripeSecretKey;

            // Create o retrieve stripe customer
            String customerId = user.getStripeCustomerId();
            if (customerId == null || customerId.isEmpty()) { 
                Customer customer = Customer.create(
                    CustomerCreateParams.builder()
                        .setEmail(user.getEmail())
                        .setName(user.getName())
                        .build()
                    );
                    customerId = customer.getId();
                    user.setStripeCustomerId(customerId);
                    userRepository.save(user);

            }
            
            // Create a checkout session
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setCustomer(customerId)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setPrice(priceId)
                        .setQuantity(1L)
                        .build()
                )
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .build();

            Session session = Session.create(params);
            return session.getUrl();

        } catch (StripeException e) {
            throw new ResponseStatusException(
                INTERNAL_SERVER_ERROR,
                "Failed to create checkout session: " + e.getMessage()
            );
        }
    }

    /**
     * Handles Stripe webhook events
     * @param payload The webhook payload
     * @param signature The Stripe signature header
     */
    public void handleWebhook(String payload, String signature) {
        if (webhookSecret == null || webhookSecret.isEmpty()) {
            throw new ResponseStatusException(
                INTERNAL_SERVER_ERROR,
                "Stripe webhook secret is not configured. Please configure stripe.webhook-secret in application.properties"
            );
        }
        
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
        
            switch (event.getType()) {
                case "checkout.session.completed":
                    handleCheckoutSessionCompleted(event);
                    break;
                case "customer.subscription.updated":
                    handleSubscriptionUpdated(event);
                    break;
                case "customer.subscription.deleted":
                    handleSubscriptionDeleted(event);
                    break;
                default:
                    // log unhandled event types
                    System.out.println("Unhandled event type: " + event.getType());
            }
        } catch (SignatureVerificationException e) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid webhook signature");
        } catch (Exception e) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Error processing webhook: " + e.getMessage());
        }
    }

    /**
     * Handles the checkout.session.completed event
     */
    private void handleCheckoutSessionCompleted(Event event) {
        Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);

        if (session == null) {
            return;
        }

        String customerId = session.getCustomer();
        Optional<User> userOpt = userRepository.findByStripeCustomerId(customerId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setSubscriptionStatus("ACTIVE");
            user.setSubscriptionStartDate(LocalDateTime.now());

            // Get subscription ID from session 
            String subscriptionId = session.getSubscription();
            if (subscriptionId != null && !subscriptionId.isEmpty()) {
                user.setStripeSubscriptionId(subscriptionId);
            }

            userRepository.save(user);
        }
    }

    /**
     * Handles the customer.subscription.updated event
     */
    private void handleSubscriptionUpdated(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);

        if (subscription == null) {
            return;
        }
        String subscriptionId = subscription.getId();
        Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String status = subscription.getStatus();

            // Map Stripe status to our status
            switch (status) {
                case "active":
                    user.setSubscriptionStatus("ACTIVE");
                    break;
                case "past_due":
                    user.setSubscriptionStatus("PAST_DUE");
                    break;
                case "canceled":
                case "unpaid":
                    user.setSubscriptionStatus("CANCELLED");
                    break;
            }

            // Update dates
            if (subscription.getCurrentPeriodStart() != null) {
                user.setSubscriptionStartDate(
                    LocalDateTime.ofEpochSecond(subscription.getCurrentPeriodStart(), 0, java.time.ZoneOffset.UTC)
                );
            }
            if (subscription.getCurrentPeriodEnd() != null) {
                user.setSubscriptionEndDate(
                    LocalDateTime.ofEpochSecond(subscription.getCurrentPeriodEnd(), 0, java.time.ZoneOffset.UTC)
                );
            }

            userRepository.save(user);
        }
    }

    /**
     * Handles the customer.subscription.deleted event
     */
    private void handleSubscriptionDeleted(Event event) {
        Subscription subscription = (Subscription) event.getDataObjectDeserializer().getObject().orElse(null);

        if (subscription == null) {
            return;
        }

        String subscriptionId = subscription.getId();
        Optional<User> userOpt = userRepository.findByStripeSubscriptionId(subscriptionId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setSubscriptionStatus("EXPIRED");
            userRepository.save(user);
        }
    }

    /**
     * Handles subscription status manually
     */
    public void updateSubscriptionStatus(String customerId, String subscriptionId, String status) {
        Optional<User> userOpt = userRepository.findByStripeCustomerId(customerId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setSubscriptionStatus(status);
            if (subscriptionId != null) {
                user.setStripeSubscriptionId(subscriptionId);
            }
            userRepository.save(user);
        }
    }
}