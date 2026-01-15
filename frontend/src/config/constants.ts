/**
 * Application Constants
 * 
 * Centralized configuration values that can be overridden via environment variables.
 * Environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
 */

/**
 * Base URL for backend API requests.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

/**
 * Stripe publishable key for client-side Stripe integrations.
 */
export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "pk_test_your_publishable_key_here";
