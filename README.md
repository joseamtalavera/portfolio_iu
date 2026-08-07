# BeWorking – Virtual Office Platform

BeWorking is a full-stack virtual office application: users register and log in, manage a
mailbox, book workspaces, and optionally subscribe to a paid plan via Stripe.

This repository contains the backend API, the frontend UI, and the documentation needed to run
the system locally.

---

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | Next.js (App Router) + React + MUI + TypeScript |
| Backend  | Java 17 + Spring Boot 3.5 (layered: controller → service → repository) |
| Database | PostgreSQL, schema generated from JPA entities |
| Auth     | JWT (stateless), BCrypt password hashing |
| Payments | Stripe (server-side only) |

---

## Prerequisites

| Tool | Version | Check with |
|------|---------|------------|
| Java (JDK) | 17 or newer | `java -version` |
| Node.js | 20 or newer (Next.js 16 requirement) | `node -v` |
| PostgreSQL | 14 or newer, running on port 5432 | `pg_isready` |

Maven is **not** required — the repository includes the Maven wrapper (`./mvnw`).

---

## Setup

### 1. Create the database

```bash
psql -U postgres -c "CREATE USER bework_user WITH PASSWORD 'bework_pass';"
psql -U postgres -c "CREATE DATABASE database_iu OWNER bework_user;"
```

No schema script is needed. Hibernate creates the tables from the JPA entities on first start,
and `data.sql` seeds the demo data.

### 2. Configure the backend

Secrets are **not** stored in the repository. Copy the template and fill it in:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env`:

| Variable | Required | Notes |
|----------|----------|-------|
| `DB_USERNAME` | yes | `bework_user` if you used the commands above |
| `DB_PASSWORD` | yes | `bework_pass` if you used the commands above |
| `JWT_SECRET` | yes | generate your own: `openssl rand -base64 64 \| tr -d '\n'` |
| `STRIPE_SECRET_KEY` | optional | Stripe test key (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | optional | from `stripe listen` |
| `STRIPE_PRICE_ID` | optional | the subscription price (`price_…`) |

`JWT_SECRET` has **no default**: the application refuses to start without it rather than fall
back to a predictable signing key.

> ### Subscription (Stripe) — optional, not needed to review the app
>
> The seeded `tutor@be-working.com` account is already **active**, so **authentication and
> booking — the two dynamic features — work immediately** after login. Booking is free for any
> registered, paid user.
>
> Stripe only matters if a *brand-new* user self-registers and wants to subscribe. The three
> `STRIPE_*` variables are optional: leave them blank and everything except the subscription
> checkout works. No Stripe credentials are committed to this repository, by design.
>
> Full test-mode setup (Stripe CLI + webhook forwarding) is documented in
> [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env.local
```

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | yes | `http://localhost:8081/api` — note the `/api` suffix |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | optional | Stripe **publishable** key (`pk_test_…`) — only needed if you set up Stripe |

Anything prefixed `NEXT_PUBLIC_` is embedded into the JavaScript bundle and is readable by
anyone using the site. Only the *publishable* Stripe key belongs here — the secret key stays on
the server.

---

## Running

Two terminals.

```bash
# Terminal 1 — backend, http://localhost:8081
cd backend
./mvnw spring-boot:run
```

```bash
# Terminal 2 — frontend, http://localhost:3000
cd frontend
npm install
npm run dev
```

Then open <http://localhost:3000>.

### Demo account

The database is seeded with a ready-to-use account, including mailbox items:

| Email | Password |
|-------|----------|
| `tutor@be-working.com` | `tutor1234` |

New accounts can also be registered from the UI.

---

## Tests

**26 automated tests, all passing** — backend (JUnit + Mockito) and frontend (Vitest).

```bash
# Backend — service-layer unit tests (booking rules, auth, ownership)
cd backend && ./mvnw test

# Frontend — component & auth-utility tests
cd frontend && npm test
```

Headline coverage: double-booking rejected (409), invalid time range rejected (400),
delete scoped to the owner (403). Full matrix in [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md).

---

## Documentation

| Document | Contents |
|----------|----------|
| [`docs/API.md`](docs/API.md) | REST endpoints |
| [`docs/architecture/overview.md`](docs/architecture/overview.md) | System architecture |
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Test strategy and coverage matrix |
| [`docs/MANUAL_WALKTHROUGH.md`](docs/MANUAL_WALKTHROUGH.md) | Step-by-step tour of the running app |
| [`docs/STRUCTURE.md`](docs/STRUCTURE.md) | Detailed repository layout |
| [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md) | Common problems |
| [`notes/`](notes/) | Sequence/flow diagrams (Mermaid + SVG) for every feature |

---

## Repository Layout

```
backend/    Spring Boot API
frontend/   Next.js UI
docs/       Setup, API, architecture, testing, troubleshooting
```

---

## Troubleshooting

**`Could not resolve placeholder 'JWT_SECRET'`**
`backend/.env` is missing or has no `JWT_SECRET` — see step 2. Note the backend must be started
from *inside* the `backend/` directory, because the `.env` path is relative to the working
directory.

**`Connection refused` on port 5432**
PostgreSQL is not running. Check with `pg_isready`.

**The frontend loads but every request fails**
Confirm the backend is on port 8081 and that `NEXT_PUBLIC_API_URL` is
`http://localhost:8081/api` — the `/api` suffix is easy to omit.

More in [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).
