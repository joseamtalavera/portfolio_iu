# Auth flow — sequence diagrams

Rendered by GitHub, VS Code (Markdown Preview Mermaid), and mermaid.live.
Export to PNG from mermaid.live for the slides.

---

## 1. Login — the token is created

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant F as JwtAuthenticationFilter<br/>JwtAuthenticationFilter.java
    participant SC as authorization rules<br/>SecurityConfig.java:66
    participant C as AuthController<br/>AuthController.java:52
    participant S as AuthService<br/>AuthService.java:72
    participant AM as AuthenticationManager<br/>SecurityConfig.java:146
    participant P as DaoAuthenticationProvider<br/>SecurityConfig.java:102
    participant UDS as UserDetailsService<br/>SecurityConfig.java:85
    participant R as UserRepository<br/>UserRepository.java:18
    participant J as JwtUtil<br/>JwtUtil.java:49

    U->>F: POST /api/auth/login {email, password}
    Note over F: L53 — no Authorization header,<br/>pass through untouched
    F->>SC: continue chain
    Note over SC: L66 — /api/auth/** is permitAll.<br/>No token required to ask for a token.
    SC->>C: request allowed
    Note over C: L52 — Jackson builds AuthLoginRequest,<br/>@Valid runs @NotBlank / @Email
    C->>S: L53 — login(request)
    S->>AM: L74 — authenticate(email, password)
    AM->>P: dispatch (provider registered at SecurityConfig L72)
    P->>UDS: L105 — loadUserByUsername(email)
    UDS->>R: L87 — findByEmail(email)
    R-->>UDS: Optional of User
    UDS-->>P: L88 — UserDetails (email + BCrypt hash)
    Note over P: L106 — BCrypt.matches(typed, storedHash).<br/>Salt is read out of the stored hash.
    P-->>AM: authenticated
    AM-->>S: returns — value discarded, used as a gate
    S->>R: L77 — findByEmail(email)
    Note right of S: second read: UserDetails has no id,<br/>and the token needs it (F21)
    R-->>S: User entity
    S->>J: L80 — generateToken(email, id)
    J-->>S: signed JWT string
    S-->>C: L81 — AuthLoginResponse(token, UserResponse)
    C-->>U: L54 — 200 OK + JSON
    Note over U: token stored client-side.<br/>Server stored nothing (STATELESS, L63)
```

---

## 2. Any request after login — the token is verified

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant F as JwtAuthenticationFilter<br/>JwtAuthenticationFilter.java:50
    participant J as JwtUtil<br/>JwtUtil.java:67
    participant R as UserRepository<br/>UserRepository.java:18
    participant SCH as SecurityContextHolder<br/>(Spring Security, per-request)
    participant SC as authorization rules<br/>SecurityConfig.java:69
    participant C as Controller<br/>any @RestController

    U->>F: GET /api/bookings<br/>Authorization: Bearer eyJ...
    Note over F: L54 — header present and starts<br/>with "Bearer " → proceed
    F->>F: L59 — token = header.substring(7)
    F->>J: L60 — extractUsername(token)
    Note over J: L90 — parses AND verifies the<br/>signature using signingKey
    J-->>F: email (the subject claim)
    F->>R: L63 — findByEmail(email)
    R-->>F: User (or empty)
    F->>J: L64 — isTokenValid(token, email)
    Note over J: L78 — subject matches and not expired
    J-->>F: true
    F->>SCH: L74 — setAuthentication(UserDetails)
    Note over F: the filter NEVER rejects — it only sets<br/>the context or leaves it empty
    F->>SC: L77 — filterChain.doFilter(...)
    Note over SC: L69 — anyRequest().authenticated()<br/>context set? allow. empty? 401.
    SC->>C: request allowed
    C-->>U: 200 OK + data
```

---

## 3. The decision points — where a request dies

```mermaid
flowchart TD
    A[Request arrives] --> B{Authorization header<br/>starts with 'Bearer '?}
    B -- no --> C[Context stays empty]
    B -- yes --> D{Signature valid?}
    D -- no --> C
    D -- yes --> E{User still<br/>in the DB?}
    E -- no --> C
    E -- yes --> F{Token expired?}
    F -- yes --> C
    F -- no --> G[Set SecurityContext]
    C --> H{Path in the<br/>permitAll list?}
    G --> I[Controller runs]
    H -- yes --> I
    H -- no --> K[401 Unauthorized]
```

---

## Reading these

Three ideas the diagrams are meant to make obvious:

1. **The filter never rejects.** It sets the context or leaves it empty.
   Rejection is a separate, later step in `SecurityConfig`.
   *Filter = who are you. Config = are you allowed.*

2. **`permitAll` exists because of a chicken-and-egg problem.**
   The default rule demands a token; the login endpoint is where you get one.

3. **Two database reads happen at login.** One inside the provider to verify
   the password, one in the service to get the `id` for the token.
   See finding F21.
