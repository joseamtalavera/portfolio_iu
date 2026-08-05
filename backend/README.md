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
./mvnw clean install     # build
./mvnw spring-boot:run   # start the API on :8081
./mvnw test              # unit tests (JUnit + Mockito)
```

## Configuration / Env Vars
- Config file: `src/main/resources/application.properties`
- Optional env file: `backend/.env` (loaded when running from `backend` folder)
- Env vars: see the setup tables in the root [README](../README.md#setup); template in `backend/.env.example`
