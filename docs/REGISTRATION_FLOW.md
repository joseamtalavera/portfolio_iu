# Registration Process Flow

## Visual Sketch

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                             │
│                         http://localhost:3000                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. User fills form
                                    ▼
                    ┌───────────────────────────────┐
                    │   page.tsx (Landing Page)     │
                    │   - name, email, password     │
                    │   - handleSubmit()            │
                    └───────────────────────────────┘
                                    │
                                    │ 2. Client-side validation
                                    ▼
                    ┌───────────────────────────────┐
                    │   utils/auth.ts               │
                    │   validateRegister()          │
                    │   ✓ name not empty            │
                    │   ✓ email contains "@"        │
                    │   ✓ password >= 6 chars       │
                    └───────────────────────────────┘
                                    │
                                    │ 3. If valid, call API
                                    ▼
                    ┌───────────────────────────────┐
                    │   utils/auth.ts               │
                    │   registerUser()               │
                    │   POST /api/auth/register      │
                    │   Body: {name, email, pwd}    │
                    └───────────────────────────────┘
                                    │
                                    │ HTTP POST Request
                                    │ Content-Type: application/json
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Spring Boot)                          │
│                         http://localhost:8081                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 4. Request received
                                    ▼
                    ┌───────────────────────────────┐
                    │   AuthController.java         │
                    │   @PostMapping("/register")   │
                    │   register(@Valid request)    │
                    └───────────────────────────────┘
                                    │
                                    │ 5. @Valid triggers validation
                                    │    (Jakarta Validation)
                                    ▼
                    ┌───────────────────────────────┐
                    │   AuthRegisterRequest.java    │
                    │   ✓ @NotBlank name            │
                    │   ✓ @Email email              │
                    │   ✓ @Size(min=6) password     │
                    └───────────────────────────────┘
                                    │
                                    │ 6. If valid, call service
                                    ▼
                    ┌───────────────────────────────┐
                    │   AuthService.java            │
                    │   register(request)           │
                    └───────────────────────────────┘
                                    │
                                    │ 7. Check if email exists
                                    ▼
                    ┌───────────────────────────────┐
                    │   UserRepository.java         │
                    │   existsByEmail(email)        │
                    │   → SELECT COUNT(*) FROM...   │
                    └───────────────────────────────┘
                                    │
                                    │ 8. If email exists → 400 BAD_REQUEST
                                    │    "Email already exists"
                                    │
                                    │ 9. If email NOT exists → continue
                                    ▼
                    ┌───────────────────────────────┐
                    │   PasswordEncoder              │
                    │   (BCryptPasswordEncoder)      │
                    │   encode(password)            │
                    │   → "$2a$10$hashed..."        │
                    └───────────────────────────────┘
                                    │
                                    │ 10. Create User entity
                                    ▼
                    ┌───────────────────────────────┐
                    │   User.builder()               │
                    │   .name(name)                  │
                    │   .email(email)                │
                    │   .password(hashedPassword)    │
                    │   .build()                     │
                    │   (subscriptionStatus defaults │
                    │    to "INACTIVE")              │
                    └───────────────────────────────┘
                                    │
                                    │ 11. Save to database
                                    ▼
                    ┌───────────────────────────────┐
                    │   UserRepository.save(user)    │
                    └───────────────────────────────┘
                                    │
                                    │ 12. Hibernate generates SQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE (PostgreSQL)                          │
│                         localhost:5432                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 13. Execute INSERT
                                    ▼
                    ┌───────────────────────────────┐
                    │   INSERT INTO users          │
                    │   (name, email, password,    │
                    │    subscription_status)      │
                    │   VALUES (?, ?, ?, 'INACTIVE')│
                    │                              │
                    │   Note: id is NOT included   │
                    │   (GenerationType.IDENTITY)  │
                    └───────────────────────────────┘
                                    │
                                    │ 14. PostgreSQL auto-generates ID
                                    │     (BIGSERIAL: 1, 2, 3...)
                                    │
                                    │ 15. Hibernate queries ID back
                                    │     SELECT currval('users_id_seq')
                                    │
                                    │ 16. Return saved User with ID
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Spring Boot)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 17. Create response DTO
                                    ▼
                    ┌───────────────────────────────┐
                    │   AuthRegisterResponse          │
                    │   {                             │
                    │     message: "User registered   │
                    │               successfully",    │
                    │     userId: 1                   │
                    │   }                             │
                    └───────────────────────────────┘
                                    │
                                    │ 18. Return HTTP 200 OK
                                    │     ResponseEntity.ok(response)
                                    │
                                    │ HTTP Response
                                    │ Status: 200 OK
                                    │ Body: JSON
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 19. Receive response
                                    ▼
                    ┌───────────────────────────────┐
                    │   utils/auth.ts               │
                    │   registerUser()               │
                    │   → returns data              │
                    └───────────────────────────────┘
                                    │
                                    │ 20. Show success message
                                    ▼
                    ┌───────────────────────────────┐
                    │   page.tsx                    │
                    │   setSuccess("Registration    │
                    │            successful!...")   │
                    │   Display Alert (green)       │
                    └───────────────────────────────┘
                                    │
                                    │ 21. Wait 1.5 seconds
                                    │     setTimeout(1500ms)
                                    │
                                    │ 22. Redirect to login
                                    ▼
                    ┌───────────────────────────────┐
                    │   router.push("/login")        │
                    │   → Navigate to login page    │
                    └───────────────────────────────┘
```

## Step-by-Step Breakdown

### Frontend Steps (1-3)

1. **User Input**: User fills registration form on landing page (`page.tsx`)
   - Fields: `name`, `email`, `password`
   - Form submission triggers `handleSubmit()`

2. **Client-Side Validation**: `validateRegister()` checks:
   - Name is not empty
   - Email contains "@"
   - Password is at least 6 characters

3. **API Call**: If validation passes, `registerUser()` sends:
   ```javascript
   POST http://localhost:8081/api/auth/register
   Content-Type: application/json
   Body: { name, email, password }
   ```

### Backend Steps (4-11)

4. **Controller Receives**: `AuthController.register()` receives request
   - Endpoint: `POST /api/auth/register`
   - Annotated with `@Valid` for server-side validation

5. **Server-Side Validation**: Jakarta Validation checks:
   - `@NotBlank` on name
   - `@Email` on email
   - `@Size(min=6)` on password
   - If invalid → returns `400 Bad Request`

6. **Service Layer**: `AuthService.register()` is called

7. **Email Check**: `UserRepository.existsByEmail(email)`
   - Executes: `SELECT COUNT(*) FROM users WHERE email = ?`
   - If email exists → throws `400 Bad Request: "Email already exists"`

8. **Password Hashing**: `PasswordEncoder.encode(password)`
   - Uses BCrypt algorithm
   - Converts plain password to: `$2a$10$hashed...`
   - **Never stores plain passwords!**

9. **Create User Entity**: `User.builder()` creates entity:
   ```java
   User user = User.builder()
       .name(request.name())
       .email(request.email())
       .password(hashedPassword)
       .subscriptionStatus("INACTIVE")  // Default value
       .build();
   ```

10. **Save to Database**: `userRepository.save(user)`

### Database Steps (12-16)

11. **Hibernate Generates SQL**:
    ```sql
    INSERT INTO users (name, email, password, subscription_status)
    VALUES (?, ?, ?, 'INACTIVE')
    ```
    - Note: `id` is **NOT** in the INSERT (because of `GenerationType.IDENTITY`)

12. **PostgreSQL Auto-Generates ID**:
    - Column `id` is `BIGSERIAL` (auto-increment)
    - PostgreSQL assigns next available ID (e.g., 1, 2, 3...)

13. **Hibernate Retrieves ID**:
    ```sql
    SELECT currval('users_id_seq')
    ```
    - Gets the generated ID from the database
    - Sets it on the `User` object: `user.setId(1L)`

14. **Return Saved User**: `User` object now has `id` populated

### Backend Response (17-18)

15. **Create Response DTO**:
    ```java
    return new AuthRegisterResponse(
        "User registered successfully",
        saved.getId()  // e.g., 1
    );
    ```

16. **HTTP Response**:
    ```
    Status: 200 OK
    Content-Type: application/json
    Body: {
      "message": "User registered successfully",
      "userId": 1
    }
    ```

### Frontend Completion (19-22)

17. **Receive Response**: `registerUser()` returns the response data

18. **Show Success**: `setSuccess("Registration successful! Redirecting to login...")`
    - Displays green success alert

19. **Wait 1.5 seconds**: `setTimeout(() => router.push("/login"), 1500)`

20. **Redirect**: Navigate to `/login` page

## Error Handling

### Frontend Errors

- **Validation Error**: Shows error alert, form stays on page
- **Network Error**: Shows "Registration failed" error
- **Server Error**: Shows error message from server response

### Backend Errors

- **400 Bad Request**: Email already exists → `"Email already exists"`
- **400 Bad Request**: Validation failed → Jakarta Validation error messages
- **500 Internal Server Error**: Database error, connection issues, etc.

## Key Components

| Component | File | Purpose |
|-----------|------|---------|
| **Frontend Form** | `frontend/src/app/page.tsx` | Registration UI |
| **Frontend API Call** | `frontend/src/utils/auth.ts` | HTTP request to backend |
| **Backend Controller** | `backend/.../AuthController.java` | Receives HTTP request |
| **Backend Service** | `backend/.../AuthService.java` | Business logic |
| **Backend Repository** | `backend/.../UserRepository.java` | Database operations |
| **User Entity** | `backend/.../entities/User.java` | JPA entity mapping |
| **Database** | PostgreSQL `users` table | Data persistence |

## Security Notes

1. **Password Hashing**: Passwords are hashed with BCrypt before storage
2. **Email Uniqueness**: Database enforces unique constraint on email
3. **Validation**: Both client-side and server-side validation
4. **No JWT Token**: Registration doesn't return a token (user must login separately)
