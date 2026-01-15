"use client";
/**
 * Auth utilities for registration, login, and client-side validation.
 */
import { API_URL } from "@/config/constants";

/**
 * Registers a new user.
 *
 * @param name full name
 * @param email email address
 * @param password user password
 * @returns parsed response body
 * @throws Error when the request fails
 */
export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }
  return data;
}

/**
 * Logs a user in and returns token + user info.
 *
 * @param email email address
 * @param password user password
 * @returns login payload containing token and user
 * @throws Error when the request fails
 */
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }
  return data as {
    token: string;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
}

/**
 * Validates registration fields.
 *
 * @param name full name
 * @param email email address
 * @param password user password
 * @returns error message or null if valid
 */
export function validateRegister(name: string, email: string, password: string) {
  if (!name.trim()) return "Name is required";
  if (!email.includes("@")) return "Invalid email address";
  if (!password.trim()) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

/**
 * Validates login fields.
 *
 * @param email email address
 * @param password user password
 * @returns error message or null if valid
 */
export function validateLogin(email: string, password: string) {
  if (!email.includes("@")) return "Invalid email address";
  if (!password.trim()) return "Password is required";
  return null;
}
