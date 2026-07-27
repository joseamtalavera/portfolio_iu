# Flow 2 — Booking

Three endpoints, all under `/api/bookings`, all requiring a valid token.
This is the first flow that runs *after* authentication, so every diagram
below starts where Flow 1.3 ended: with the security context populated.

---

## 1. Create a booking

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant F as JwtAuthenticationFilter<br/>JwtAuthenticationFilter.java:50
    participant SC as authorization rules<br/>SecurityConfig.java:69
    participant C as BookingController<br/>BookingController.java:44
    participant US as UserService<br/>UserService.java:94
    participant SCH as SecurityContextHolder<br/>Spring Security, per-request
    participant UR as UserRepository<br/>UserRepository.java:18
    participant S as BookingService<br/>BookingService.java:40
    participant BR as BookingRepository<br/>BookingRepository.java:13

    U->>F: POST /api/bookings<br/>Authorization: Bearer eyJ...
    Note over F: Flow 1.3 runs: verify signature,<br/>load user, build UserDetails
    F->>SCH: WRITE — JwtAuthenticationFilter.java:74<br/>setAuthentication(UserDetails)
    Note over SCH: the ONLY write in the codebase.<br/>Read back below at UserService.java:95
    F->>SC: L77 — continue chain
    Note over SC: L69 — anyRequest().authenticated()<br/>context is set, so allowed
    SC->>C: request allowed
    Note over C: L44 — Jackson builds BookingRequest.<br/>@Valid: @NotBlank product, @FutureOrPresent<br/>date, @NotNull hours, @Min(1) attendees
    C->>US: L45 — getCurrentUser()
    US->>SCH: READ — UserService.java:95<br/>getAuthentication().getPrincipal()
    SCH-->>US: the same UserDetails the filter wrote
    US->>UR: L104 — findByEmail(email)
    UR-->>US: User entity
    US-->>C: User
    C->>S: L46 — createBooking(user, request)
    Note over S: L43 — endHour must be after startHour<br/>else 400 Bad Request
    S->>BR: L48 — existsBy...StartHourLessThan...EndHourGreaterThan
    Note over BR: two periods overlap when each<br/>starts before the other ends
    BR-->>S: false — the slot is free<br/>(true would be 409 Conflict)
    S->>BR: L61 — save(booking)
    BR-->>S: Booking with generated id
    S-->>C: L62 — BookingCreatedResponse(id, message)
    C-->>U: 201 Created
    Note over C: @ResponseStatus(HttpStatus.CREATED)<br/>— not 200, because a resource was made
```

---

## 2. List my bookings

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant C as BookingController<br/>BookingController.java:55
    participant US as UserService<br/>UserService.java:94
    participant S as BookingService<br/>BookingService.java:86
    participant BR as BookingRepository<br/>BookingRepository.java:20

    Note over U: filter + authorization already passed
    U->>C: GET /api/bookings
    C->>US: L56 — getCurrentUser()
    US-->>C: User
    C->>S: L57 — listBookings(user)
    S->>BR: L87 — findAllByUser(user)
    Note over BR: WHERE user_id = ?<br/>scoped by the caller, not by a filter
    BR-->>S: List of Booking
    Note over S: L88 — map each entity to BookingResponse
    S-->>C: List of BookingResponse
    C-->>U: 200 OK + JSON array
```

---

## 3. Delete a booking — the authorization step

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant C as BookingController<br/>BookingController.java:66
    participant US as UserService<br/>UserService.java:94
    participant S as BookingService<br/>BookingService.java:72
    participant BR as BookingRepository<br/>BookingRepository.java:29

    U->>C: DELETE /api/bookings/42
    C->>US: L67 — getCurrentUser()
    US-->>C: User
    C->>S: L68 — deleteBooking(user, 42)
    S->>BR: L74 — findByIdAndUser_Id(42, user.getId())
    Note over BR: WHERE id = ? AND user_id = ?<br/>ownership is part of the QUERY,<br/>not an if-statement afterwards
    alt booking exists and belongs to caller
        BR-->>S: Booking
        S->>BR: L77 — delete(booking)
        S-->>C: void
        C-->>U: 204 No Content
    else not found, or owned by someone else
        BR-->>S: empty
        S-->>C: L75 — ResponseStatusException(FORBIDDEN)
        C-->>U: 403 Forbidden
    end
```

---

## What these diagrams are meant to show

**Authentication is invisible here, and that is the point.** No booking file
mentions tokens, headers or signatures. The filter did that work already, and
`getCurrentUser()` reads the result. Flow 1 exists so Flow 2 can ignore it.

**Ownership is enforced in the query, not after it.** `findByIdAndUser_Id`
means a booking belonging to another user is never loaded in the first place.
The alternative — load by id, then `if (!booking.getUser().equals(user))` —
is one forgotten `if` away from letting anyone delete anything.

**Identity is written once and read once.** The filter writes to
`SecurityContextHolder` at `JwtAuthenticationFilter.java:74`; `UserService.java:95`
reads it back. That single write and single read are the only reason a booking
knows who made it — nothing in `BookingRequest` carries a user.

**Validation happens at two layers, answering two questions.** `@Valid` on the DTO
asks whether each field is well-formed. `BookingService` asks whether the fields
make sense together (`endHour` after `startHour`) and against what is already
stored (no overlapping booking). Bean Validation cannot answer the second kind.
