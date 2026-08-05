# Flow 5 — Mailbox

One endpoint, `GET /api/mailbox`, requiring a valid token. It is the simplest
feature flow in the codebase — no request body, no validation, no writes — and it
exists mainly to show two things: ownership scoping in the query, and how the PDF
attachments are served outside the JSON.

Rendered by GitHub, VS Code (Markdown Preview Mermaid), and mermaid.live.
Export to PNG from mermaid.live for the slides.

---

## 1. List my mailbox items

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant SC as authorization rules<br/>SecurityConfig.java:69
    participant C as MailboxController<br/>MailboxController.java:38
    participant US as UserService<br/>UserService.java:94
    participant S as MailboxService<br/>MailboxService.java:33
    participant R as MailboxItemRepository<br/>MailboxItemRepository.java:19
    participant DB as PostgreSQL

    Note over U: filter + authorization already passed (Flow 1.3)
    U->>SC: GET /api/mailbox<br/>Authorization: Bearer eyJ...
    Note over SC: L69 — anyRequest().authenticated()<br/>context is set, so allowed
    SC->>C: request allowed
    C->>US: L40 — getCurrentUser()
    US-->>C: User (from SecurityContext)
    C->>S: L41 — getMailbox(user)
    S->>R: L34 — findAllByUser(user)
    Note over R: WHERE user_id = ?<br/>scoped by the caller, not by a filter
    R->>DB: SELECT * FROM mailbox_item WHERE user_id = ?
    DB-->>R: List of MailboxItem
    R-->>S: List of MailboxItem
    Note over S: L35 — map each entity to<br/>MailboxItemResponse(id, subject,<br/>message, timestamp, pdfUrl)
    S-->>C: List of MailboxItemResponse
    C-->>U: 200 OK + JSON array
    Note over U: each item's pdfUrl points at /pdfs/...
```

---

## 2. Opening an attachment — served outside the JSON

```mermaid
flowchart TD
    A[JSON item.pdfUrl<br/>e.g. /pdfs/mail-1.pdf] --> B[browser requests the PDF]
    B --> C{path under /pdfs/**?}
    C -- yes --> D[permitAll — SecurityConfig.java:68<br/>no token required]
    D --> E[static file from<br/>resources/static/pdfs/]
    E --> F[browser opens the PDF]
```

---

## What these diagrams are meant to show

**Ownership is in the query, exactly like bookings.** `findAllByUser(user)` means
another user's mail is never loaded — the scoping is the `WHERE user_id = ?`, not a
check afterwards. Same pattern as `findByIdAndUser_Id` in the booking delete flow.

**The entity never leaves the service.** `MailboxItem` (a JPA entity) is mapped to
`MailboxItemResponse` (a DTO) at `MailboxService.java:35` before returning. The API
exposes a chosen shape — id, subject, message, timestamp, pdfUrl — not the raw table.

**The PDF is a separate, public request.** The JSON carries only a `pdfUrl` string.
The file itself is fetched afterwards from `/pdfs/**`, which is `permitAll`
(`SecurityConfig.java:68`) — a static resource, not an authenticated API call. The
list is private; the attachment bytes are served like any other static asset.

**This is the read-only baseline.** No POST, no `@Valid`, no overlap check — mailbox
is the control case that makes the booking flow's extra machinery (validation,
conflict detection, 201 vs 200) easy to see by contrast.
