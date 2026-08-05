# Flow 3 — Subscription (Stripe)

Two endpoints under `/api/subscription`. They are authorized in opposite ways:
`/create-checkout` needs a token like every other feature; `/webhook` is public
(`SecurityConfig.java:67` permitAll) because the caller is Stripe, not the user —
it carries no JWT and proves itself with a signature instead.

Rendered by GitHub, VS Code (Markdown Preview Mermaid), and mermaid.live.
Export to PNG from mermaid.live for the slides.

---

## 1. Creating the checkout session — the user starts paying

```mermaid
sequenceDiagram
    autonumber
    actor U as User<br/>browser
    participant SC as authorization rules<br/>SecurityConfig.java:69
    participant C as SubscriptionController<br/>SubscriptionController.java:37
    participant US as UserService<br/>UserService.java:94
    participant S as SubscriptionService<br/>SubscriptionService.java:66
    participant UR as UserRepository<br/>UserRepository.java
    participant STR as Stripe API

    U->>SC: POST /api/subscription/create-checkout<br/>Authorization: Bearer eyJ...
    Note over SC: L69 — anyRequest().authenticated()<br/>context set by the JWT filter (Flow 1.3), so allowed
    SC->>C: request allowed
    C->>US: L39 — getCurrentUser()
    US-->>C: User (who is paying)
    C->>S: L40 — createCheckoutSession(user)
    Note over S: L67 — guard: secret-key AND price-id present?<br/>if not → 500, Stripe never called
    S->>S: L77 — Stripe.apiKey = secretKey
    alt user has no Stripe customer yet
        S->>STR: L82 — Customer.create(email, name)
        STR-->>S: customer id (cus_...)
        S->>UR: L90 — save(user with stripeCustomerId)
        Note over UR: the id is stored so the webhook<br/>can find this user later
    end
    S->>STR: L108 — Session.create(mode=SUBSCRIPTION,<br/>customer, price, success/cancel URLs)
    STR-->>S: Session with hosted checkout url
    S-->>C: L109 — return session.getUrl()
    C-->>U: L41 — 200 OK + { url }
    Note over U: browser redirects to Stripe's page.<br/>No card data ever touches this server.
```

---

## 2. The webhook — Stripe reports the payment, we flip the status

```mermaid
sequenceDiagram
    autonumber
    actor STR as Stripe<br/>(server-to-server)
    participant SC as authorization rules<br/>SecurityConfig.java:67
    participant C as SubscriptionController<br/>SubscriptionController.java:51
    participant S as SubscriptionService<br/>SubscriptionService.java:126
    participant W as Stripe SDK<br/>Webhook.constructEvent
    participant UR as UserRepository<br/>UserRepository.java
    participant DB as PostgreSQL

    STR->>SC: POST /api/subscription/webhook<br/>Stripe-Signature: t=...,v1=...
    Note over SC: L67 — permitAll: no JWT expected.<br/>Trust comes from the signature, not a token.
    SC->>C: request allowed
    C->>S: L55 — handleWebhook(payload, signature)
    Note over S: L127 — guard: webhook-secret present?<br/>if not → 500
    S->>W: L135 — constructEvent(payload, signature, secret)
    Note over W: recomputes the signature over the raw body.<br/>mismatch → SignatureVerificationException → 400 (L151)
    W-->>S: verified Event
    Note over S: L137 — switch on event.getType()
    S->>S: L139 — checkout.session.completed<br/>→ handleCheckoutSessionCompleted()
    S->>UR: L168 — findByStripeCustomerId(customerId)
    UR-->>S: the user from diagram 1
    Note over S: L172 — setSubscriptionStatus("ACTIVE")<br/>L173 — setSubscriptionStartDate(now)
    S->>DB: L181 — save(user)
    DB-->>S: status persisted
    S-->>C: void
    C-->>STR: L56 — 200 OK "Webhook processed successfully"
```

---

## 3. Where the payment flow can fail

```mermaid
flowchart TD
    A[POST /create-checkout] --> B{secret-key AND<br/>price-id configured?}
    B -- no --> C[500 — Stripe never called<br/>SubscriptionService.java:69]
    B -- yes --> D[Stripe.apiKey set]
    D --> E{StripeException?<br/>Customer/Session.create}
    E -- yes --> F[500 — SubscriptionService.java:112]
    E -- no --> G[200 + checkout url]

    H[POST /webhook] --> I{webhook-secret<br/>configured?}
    I -- no --> J[500 — SubscriptionService.java:128]
    I -- yes --> K{signature valid?<br/>constructEvent}
    K -- no --> L[400 Invalid webhook signature<br/>SubscriptionService.java:151]
    K -- yes --> M{event type handled?}
    M -- no --> N["default: ignored (L147)"]
    M -- yes --> O[update user, save]
```

---

## What these diagrams are meant to show

**The activation is not the click — it is the webhook.** Diagram 1 only sends
the user to Stripe and returns a URL. The account is still `INACTIVE` at that
point. Status flips to `ACTIVE` only in diagram 2, when Stripe calls *us* back.
The two halves are connected by one value: the `stripeCustomerId` saved at
`SubscriptionService.java:90` and read back at `:168`.

**The webhook is public on purpose, but not unprotected.** It is the one endpoint
past the JWT wall (`SecurityConfig.java:67`) because Stripe has no token. The wall
is replaced, not removed: `constructEvent` recomputes the signature over the raw
body and rejects a forgery with 400. permitAll here means "no JWT", not "no check".

**No card data touches this server.** The card is entered on Stripe's hosted page
in diagram 1. This backend only ever holds Stripe *identifiers* (`cus_...`,
`sub_...`) and a status string — never a PAN. That is the whole reason to redirect
rather than collect payment ourselves.

**Missing configuration fails loudly, not silently.** Both entry points guard on
their secrets first (`:67`, `:127`) and return 500 rather than half-run. With no
Stripe keys the feature is simply off — every other feature keeps working, which
is why the keys are optional in `.env`.
