# BeWorking – Virtual Office Platform

BeWorking is a full-stack virtual office app for registration/login, mailbox management, bookings, and optional subscriptions.  
This repository contains the backend API, frontend UI, and operational documentation for running the system locally.

## Tech Stack
- Frontend: Next.js + React + MUI
- Backend: Java 17 + Spring Boot
- Database: PostgreSQL
- Auth: JWT

## Quickstart
```bash
# Backend
cd backend
mvn clean install
mvn spring-boot:run

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Repo Map
- `backend/` – Spring Boot API (see `backend/README.md`)
- `frontend/` – Next.js UI (see `frontend/README.md`)
- `docs/` – setup, API, testing, troubleshooting
- `docs/architecture/overview.md` – system architecture overview
- `docs/runbook/README.md` – operational runbooks
