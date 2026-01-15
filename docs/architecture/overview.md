# Architecture Overview

## System Summary
BeWorking is a two-tier web application with a Next.js frontend and a Spring Boot backend backed by PostgreSQL. The frontend calls the backend API over HTTP and uses JWT tokens for authentication.

## High-Level Flow
1. User registers or logs in via the frontend.
2. Backend validates credentials, issues JWT, and returns user data.
3. Frontend stores token and calls protected endpoints for dashboard data.
4. Mailbox and bookings data are fetched from PostgreSQL via JPA repositories.
5. Subscription checkout is initiated via the backend (Stripe integration optional).

## Core Components
- Frontend UI (Next.js + MUI) in `frontend/`
- Backend API (Spring Boot) in `backend/`
- PostgreSQL database for persistence

## Data Boundaries
- Frontend only accesses backend through API endpoints.
- Backend is the single source of truth for user, mailbox, and booking data.

## Security Model
- JWT-based authentication on protected endpoints.
- Spring Security filter validates tokens on incoming requests.
