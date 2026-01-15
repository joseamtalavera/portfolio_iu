package com.beworking.backend.repositories;

import com.beworking.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository for user persistence and lookup operations.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    /**
     * Finds a user by email address.
     *
     * @param email email address
     * @return an Optional containing the user if found, or empty if not
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists for the given email.
     *
     * @param email email address
     * @return true if a user exists
     */
    boolean existsByEmail(String email);

    /**
     * Finds a user by Stripe customer ID.
     *
     * @param stripeCustomerId Stripe customer ID
     * @return an Optional containing the user if found, or empty if not
     */
    Optional<User> findByStripeCustomerId(String stripeCustomerId);

    /**
     * Finds a user by Stripe subscription ID.
     *
     * @param stripeSubscriptionId Stripe subscription ID
     * @return an Optional containing the user if found, or empty if not
     */
    Optional<User> findByStripeSubscriptionId(String stripeSubscriptionId);
}
