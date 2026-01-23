# Registration Process Flow (Concise)

## Visual Sketch

```
┌───────────────────────────────┐
│        FRONTEND (Next.js)     │
│  page.tsx -> handleSubmit()   │
└───────────────┬───────────────┘
                │
                │ validateRegister()
                ▼
        registerUser() -> POST /api/auth/register
                │
                ▼
┌───────────────────────────────┐
│       BACKEND (Spring Boot)   │
│  AuthController.register()    │
│           @Valid              │
└───────────────┬───────────────┘
                │
                ▼
        AuthService.register()
        ├─ UserRepository.existsByEmail()
        ├─ PasswordEncoder.encode()
        ├─ UserRepository.save()
        └─ AuthRegisterResponse
                │
                ▼
┌───────────────────────────────┐
│    DATABASE (PostgreSQL)      │
│   users table (INSERT, ID)    │
└───────────────────────────────┘
```

## Steps (8–10)

1. User fills registration form on `frontend/src/app/page.tsx` and submits.
2. `validateRegister()` in `frontend/src/utils/auth.ts` checks name/email/password.
3. If valid, `registerUser()` sends `POST /api/auth/register` with `{ name, email, password }`.
4. `AuthController.register()` receives the request and triggers server validation (`@Valid`).
5. `AuthService.register()` checks if the email already exists.
6. Password is hashed with `PasswordEncoder` (BCrypt).
7. A `User` entity is created and saved via `UserRepository.save()`.
8. Hibernate writes the row to PostgreSQL and returns the generated ID.
9. Backend responds with `AuthRegisterResponse { message, userId }`.
10. Frontend shows success and redirects to `/login`.

## Notes
- Client validation is for UX; server validation is authoritative.
- Passwords are never stored in plain text.
