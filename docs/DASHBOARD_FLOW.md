ok # Dashboard Process Flow (Concise)

## Visual Sketch

```
┌───────────────────────────────┐
│        FRONTEND (Next.js)     │
│  dashboard/page.tsx           │
└───────────────┬───────────────┘
                │
                │ 1) Read token/user from localStorage
                ▼
        If no token -> redirect /login
                │
                │ 2) fetchData() -> GET /bookings and /mailbox
                ▼
┌───────────────────────────────┐
│       BACKEND (Spring Boot)   │
│   JwtAuthenticationFilter     │
│   (Authorization: Bearer ...) │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│  BookingController / Mailbox  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│        FRONTEND (Next.js)     │
│  setBookings + setMailbox     │
│  compute stats + render UI    │
└───────────────────────────────┘
```

## Steps (8–10)

1. Dashboard page loads (`frontend/src/app/dashboard/page.tsx`).
2. It checks `localStorage` for a `jwt` token.
3. If no token, it redirects to `/login`.
4. If token exists, it calls `fetchData()`.
5. `fetchData()` runs two API calls in parallel:
   - `GET /api/bookings`
   - `GET /api/mailbox`
6. Backend validates JWT and returns JSON lists.
7. Frontend stores results in state (`setBookings`, `setMailbox`).
8. It computes summary stats and upcoming bookings.
9. UI renders cards, tables, and status chip.
10. Errors show an alert; loading shows a spinner.

## Notes
- Token is sent in the `Authorization: Bearer <token>` header.
- If token expires, backend returns 401 and frontend should redirect to login.
