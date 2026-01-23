# Login Process Flow (Concise)

## Visual Sketch

```
┌───────────────────────────────┐
│        FRONTEND (Next.js)     │
│  login/page.tsx -> handleSubmit│
└───────────────┬───────────────┘
                │
                │ validateLogin()
                ▼
        loginUser() -> POST /api/auth/login
                │
                ▼
┌───────────────────────────────┐
│       BACKEND (Spring Boot)   │
│  AuthController.login()       │
│           @Valid              │
└───────────────┬───────────────┘
                │
                ▼
        AuthService.login()
        ├─ AuthenticationManager.authenticate()
        ├─ UserRepository.findByEmail()
        ├─ JwtUtil.generateToken()
        └─ AuthLoginResponse
                │
                ▼
┌───────────────────────────────┐
│    FRONTEND (Next.js)         │
│  Save token + user in storage │
│  Redirect to /dashboard       │
└───────────────────────────────┘
```

## Steps (8–10)

1. User fills login form on `frontend/src/app/login/page.tsx` and submits.
2. `validateLogin()` in `frontend/src/utils/auth.ts` checks email/password.
3. If valid, `loginUser()` sends `POST /api/auth/login` with `{ email, password }`.
4. `AuthController.login()` receives the request and triggers server validation (`@Valid`).
5. `AuthService.login()` authenticates via `AuthenticationManager`.
6. User is loaded from `UserRepository.findByEmail()`.
7. `JwtUtil.generateToken()` creates a JWT for the user.
8. Backend responds with `AuthLoginResponse { token, user }`.
9. Frontend stores `jwt` and `user` in `localStorage`.
10. Frontend redirects to `/dashboard`.

## Notes
- Server validation is authoritative; frontend validation is UX only.
- Token is required for protected endpoints (`/api/user/me`, `/api/bookings`, `/api/mailbox`).
