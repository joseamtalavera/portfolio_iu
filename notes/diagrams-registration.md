# Flow 1.1 — Registration

## The happy path

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant F as JwtAuthenticationFilter<br/>JwtAuthenticationFilter.java:53
    participant SC as authorization rules<br/>SecurityConfig.java:66
    participant C as AuthController<br/>AuthController.java:40
    participant S as AuthService<br/>AuthService.java:52
    participant E as BCryptPasswordEncoder<br/>SecurityConfig.java:116
    participant R as UserRepository<br/>UserRepository.java:26
    participant DB as PostgreSQL

    U->>F: POST /api/auth/register<br/>{name, email, password}
    Note over F: L53 — no Authorization header —<br/>pass through untouched
    F->>SC: continue chain
    Note over SC: L66 — /api/auth/** is permitAll
    SC->>C: allowed
    Note over C: L40 — Jackson → AuthRegisterRequest<br/>@Valid: @NotBlank, @Email,<br/>@Size(min=6) on password
    C->>S: L41 — register(request)
    S->>R: L53 — existsByEmail(email)
    R->>DB: SELECT COUNT(*) WHERE email = ?
    DB-->>R: 0
    R-->>S: false
    Note over S: L55 — email is free — continue
    S->>E: L59 — encode(plaintext password)
    E-->>S: BCrypt hash ($2a$10$...)
    Note over S: L56 — build User entity —<br/>id null, subscriptionStatus INACTIVE
    S->>R: L61 — save(user)
    R->>DB: INSERT INTO users (...)
    DB-->>R: generated id
    R-->>S: User (now with id)
    S-->>C: AuthRegisterResponse<br/>(message + id only)
    C-->>U: L42 — 200 OK + JSON
    Note over U: no token issued —<br/>the user must now log in
```

## Where registration can fail

```mermaid
flowchart TD
    A[POST /api/auth/register] --> B{Body valid?<br/>@NotBlank @Email @Size}
    B -- no --> C[400 Bad Request<br/>DB never touched]
    B -- yes --> D{existsByEmail?}
    D -- yes --> E[400 — email already registered]
    D -- no --> F[BCrypt hash the password]
    F --> G[save entity]
    G --> H{DB unique constraint<br/>violated?}
    H -- yes --> I["500 — F5<br/>lost the race with a<br/>concurrent registration"]
    H -- no --> J["200 + AuthRegisterResponse<br/>(message + id)"]
```

## Two things the diagram is meant to make obvious

**No token is issued.** Registration ends with a user row, nothing more.
The user has to log in as a separate step. Compare with the login diagram,
where the whole point is producing a token.

**The plaintext password exists for exactly one hop** — from the DTO into
`encode()`. After that only the hash exists, and `AuthRegisterResponse` carries
nothing but a message and the new id — there is no field either one could
travel back out in.
