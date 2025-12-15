/**
 * Application Constants
 * 
 * Centralized configuration values that can be overridden via environment variables.
 * Environment variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api";

