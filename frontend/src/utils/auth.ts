"use client";
import { API_URL } from "@/config/constants";

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

export function validateRegister(name: string, email: string, password: string) {
  if (!name.trim()) return "Name is required";
  if (!email.includes("@")) return "Invalid email address";
  if (!password.trim()) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateLogin(email: string, password: string) {
  if (!email.includes("@")) return "Invalid email address";
  if (!password.trim()) return "Password is required";
  return null;
}
