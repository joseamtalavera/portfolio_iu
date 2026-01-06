# BeWorking – Virtual Office Platform

## 1) Project Overview
- Virtual office features: Register, Login, Mailbox (with PDF attachments), Bookings (create/manage), JWT-based auth, subscription (optional).
- Tech stack: Next.js 14 + MUI (frontend), Java 17 + Spring Boot (backend), PostgreSQL 14+ (database), JWT auth.

## 2) Repository Structure
```
/backend      # Spring Boot API (auth, mailbox, bookings, subscription)
/frontend     # Next.js (App Router) + MUI UI
```
- backend/src/main/java/com/beworking/backend: controllers, services, entities, repositories, security.
- backend/src/main/resources: application.properties, data.sql (seed), static PDFs.
- frontend/src/app: pages (landing/register, login, dashboard, mailbox, bookings, subscription).
- frontend/src/components: shared UI (Header, Footer, FrontLayout, dashboard layout).
- frontend/src/theme.ts: MUI theme/tokens.
- frontend/src/utils: auth helpers, time utils.

## 3) Prerequisites
- Node.js: 18.x or 20.x LTS (`node -v`)
- Java: 17+ (`java -version`)
- Maven: 3.9+ (`mvn -version`)
- PostgreSQL: 14+ (`psql --version`)
- Git

## 4) Environment Variables
### Frontend (frontend/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_placeholder
```

### Backend (backend/src/main/resources/application.properties)
```
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/database_iu
spring.datasource.username=bework_user
spring.datasource.password=bework_pass
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

# JWT
jwt.secret=changeme_base64_256bit_key
jwt.expiration-ms=3600000

# Server
server.port=8081

# Stripe (optional)
stripe.secret-key=
stripe.webhook-secret=
stripe.price-id=
stripe.success-url=http://localhost:3000/subscription/success
stripe.cancel-url=http://localhost:3000/subscription/cancel
```

## 5) Database Setup (PostgreSQL)
1. Start PostgreSQL.
2. Create DB/user:
```sql
CREATE USER bework_user WITH PASSWORD 'bework_pass';
CREATE DATABASE database_iu OWNER bework_user;
GRANT ALL PRIVILEGES ON DATABASE database_iu TO bework_user;
```
3. Verify:
```bash
psql -h localhost -U bework_user -d database_iu -c '\conninfo'
```
4. Tables are created automatically by JPA (ddl-auto=update); seed data loads from data.sql.

## 6) Run Backend (Spring Boot)
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
- URL: http://localhost:8081
- Verify: console shows "Started BeWorkingApplication"; no DB errors.

## 7) Run Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- URL: http://localhost:3000
- Verify: landing/registration page loads.

## 8) Run Both Together
- Order: PostgreSQL → backend → frontend.
- Ports: frontend 3000; backend 8081; Postgres 5432.
- If busy: change backend `server.port`; frontend `npm run dev -- -p 3001`; adjust `NEXT_PUBLIC_API_URL`.

## 9) API Endpoints (Testing)
Base: http://localhost:8081/api

### POST /auth/register (public)
Req:
```json
{ "name": "John Doe", "email": "john@example.com", "password": "password123" }
```
Resp (201):
```json
{ "message": "User registered successfully", "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```
cURL:
```bash
curl -X POST http://localhost:8081/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### POST /auth/login (public)
Req:
```json
{ "email": "john@example.com", "password": "password123" }
```
Resp (200):
```json
{ "token": "JWT_TOKEN", "user": { "id": 1, "name": "John Doe", "email": "john@example.com" } }
```
cURL:
```bash
curl -X POST http://localhost:8081/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{"email":"john@example.com","password":"password123"}'
```

### GET /user/me (Bearer)
cURL:
```bash
curl http://localhost:8081/api/user/me \
 -H "Authorization: Bearer YOUR_TOKEN"
```

### GET /mailbox (Bearer)
cURL:
```bash
curl http://localhost:8081/api/mailbox \
 -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /bookings (Bearer)
Req:
```json
{ "product": "Meeting Room", "date": "2025-01-20", "startHour": "10:00:00", "endHour": "11:30:00", "attendees": 5 }
```
cURL:
```bash
curl -X POST http://localhost:8081/api/bookings \
 -H "Authorization: Bearer YOUR_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"product":"Meeting Room","date":"2025-01-20","startHour":"10:00:00","endHour":"11:30:00","attendees":5}'
```

### GET /bookings (Bearer)
cURL:
```bash
curl http://localhost:8081/api/bookings \
 -H "Authorization: Bearer YOUR_TOKEN"
```

## 10) UI Test Script (Professor)
1. Register: http://localhost:3000 → fill name/email/password → submit → redirected to login.
2. Login: use new account → land on Dashboard.
3. Dashboard: confirm stats/cards render.
4. Mailbox: open Mailbox tab → confirm items (if seeded) load.
5. Bookings: create a booking (future date/time) → confirm it appears in list.
6. Responsive: DevTools → device toolbar → check layout on mobile sizes.

## 11) Troubleshooting
- DB: ensure Postgres running; credentials/URL match; test with `psql`.
- CORS: backend on http://localhost:8081; frontend `NEXT_PUBLIC_API_URL` matches.
- JWT/401: token expired/missing; re-login; send `Authorization: Bearer TOKEN`.
- Ports: change backend `server.port`; frontend `npm run dev -- -p 3001`; adjust `NEXT_PUBLIC_API_URL`.
- npm/Maven: clear cache, reinstall, check Node/Java versions; `mvn clean install` with network access.
