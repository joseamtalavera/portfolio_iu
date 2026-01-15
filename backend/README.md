# Backend (Spring Boot)

## Purpose
Provides the REST API for authentication, users, mailbox, bookings, and subscription checkout. It owns data access and security.

## Key Entrypoints
- `src/main/java/com/beworking/backend/BeWorkingApplication.java` – Spring Boot entry point.
- `src/main/java/com/beworking/backend/controllers/*` – REST controllers.
- `src/main/java/com/beworking/backend/services/*` – business logic.
- `src/main/java/com/beworking/backend/security/*` – JWT security and filters.
- `src/main/resources/application.properties` – runtime configuration.

## Run / Test
```bash
mvn clean install
mvn spring-boot:run
```

## Configuration / Env Vars
- Config file: `src/main/resources/application.properties`
- Optional env file: `backend/.env` (loaded when running from `backend` folder)
- Env vars list: `docs/runbook/env-vars.md`
