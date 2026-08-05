# Frontend (Next.js)

## Purpose
Provides the public landing/registration flow, login, and authenticated dashboard UI for mailbox, bookings, and subscription flows.

## Key Entrypoints
- `src/app/page.tsx` – landing/registration page.
- `src/app/login/page.tsx` – login page.
- `src/app/dashboard/page.tsx` – dashboard.
- `src/components/` – shared UI (Header/Footer/layouts/modals).
- `src/theme.ts` – MUI theme tokens.

## Run / Test
```bash
npm install
npm run dev   # start the UI on :3000
npm test      # component/util tests (Vitest)
```

## Configuration / Env Vars
- Frontend env file: `frontend/.env.local` (copy from `frontend/.env.example`)
- Env vars: see the setup tables in the root [README](../README.md#setup)
