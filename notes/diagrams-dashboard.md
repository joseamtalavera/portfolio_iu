# Flow 4 — Dashboard load

The dashboard is a *client-orchestrated* flow: no dashboard endpoint exists on the
backend. The page (`frontend/src/app/dashboard/page.tsx`) checks for a token, then
fans out to the two feature endpoints it already knows — `/bookings` and `/mailbox` —
and does all the aggregation (stats, "upcoming") itself, in the browser.

Rendered by GitHub, VS Code (Markdown Preview Mermaid), and mermaid.live.
Export to PNG from mermaid.live for the slides.

---

## 1. Loading the overview — two calls in parallel

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant D as DashboardContent<br/>dashboard/page.tsx:41
    participant LS as localStorage
    participant BE as Backend<br/>(JWT filter + controllers)

    Note over D: useEffect runs after mount
    D->>LS: L43 — getItem("jwt")
    alt no token
        LS-->>D: null
        D->>U: L45 — router.replace("/login")
        Note over D: effect returns — no data fetched
    else token present
        LS-->>D: eyJ...
        Note over D: L51 — fetchData(): setLoading(true)
        par L55 — Promise.all, both fire at once
            D->>BE: L56 — GET /api/bookings<br/>Authorization: Bearer eyJ...
            BE-->>D: 200 + Booking[]
        and
            D->>BE: L61 — GET /api/mailbox<br/>Authorization: Bearer eyJ...
            BE-->>D: 200 + MailItem[]
        end
        Note over D: L68/71 — if either !ok → throw → catch (L82)<br/>setError, spinner replaced by Alert
        D->>D: L78 — setBookings(data)
        D->>D: L79 — setMailbox(data)
        Note over D: L84 — finally: setLoading(false)
    end
```

---

## 2. What the browser computes from the two lists

```mermaid
flowchart TD
    A[bookings + mailbox in state] --> B["stats — useMemo (L92)"]
    B --> B1[deliveriesToday<br/>mailbox where date ≥ today]
    B --> B2[deliveriesThisMonth<br/>mailbox where date ≥ 1st]
    B --> B3[bookingsThisMonth<br/>bookings where date ≥ 1st]
    B --> B4["bookingsRemaining<br/>max(0, 5 − thisMonth)"]
    B --> B5[status<br/>from user.subscriptionStatus]

    A --> C["upcomingBookings — useMemo (L130)"]
    C --> C1[keep bookings where<br/>date+startHour ≥ now]
    C1 --> C2[sort ascending by start]
    C2 --> C3[slice first 5]

    B5 --> D{status === active?}
    D -- yes --> E[green Chip]
    D -- no --> F[grey Chip]
```

---

## What these diagrams are meant to show

**There is no dashboard endpoint.** The "dashboard" is a composition, not a
resource. It reuses `/bookings` and `/mailbox` and joins them on the client. That
is why nothing in the backend mentions a dashboard — the page *is* the join.

**The two calls are parallel, not sequential.** `Promise.all` at L55 fires both
requests together, so the slower of the two sets the wait — not their sum. Either
failing rejects the whole `Promise.all` and drops into one `catch`.

**The gate is the token, checked before any fetch.** L43–45 redirect to `/login`
when no `jwt` is present, so an unauthenticated user never even issues the two
requests. The backend would reject them anyway (401) — this is the UX half of the
same rule.

**Every number on the screen is derived, not stored.** "Bookings remaining",
"deliveries today", "upcoming" are all `useMemo` computations over the two raw
lists (L92, L130). The backend stores bookings and mail; the *counts* live only
in the browser and recompute when their inputs change.
