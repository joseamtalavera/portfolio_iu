# Stripe Payment Flow (Concise)

## Visual Sketch

```
┌───────────────────────────────┐
│        FRONTEND (Next.js)     │
│  paymentModal.tsx -> Subscribe│
└───────────────┬───────────────┘
                │
                │ handleSubscribe()
                ▼
        fetch() -> POST /api/subscription/create-checkout
                │
                ▼
┌───────────────────────────────┐
│       BACKEND (Spring Boot)   │
│  SubscriptionController       │
│    .createCheckoutSession()   │
└───────────────┬───────────────┘
                │
                ▼
        SubscriptionService.createCheckoutSession()
        ├─ Customer.create() (if new)
        ├─ UserRepository.save(stripeCustomerId)
        ├─ Session.create() (Stripe API)
        └─ Return checkoutUrl
                │
                ▼
┌───────────────────────────────┐
│    FRONTEND (Next.js)         │
│  Redirect to Stripe Checkout  │
└───────────────────────────────┘
                │
                ▼
┌───────────────────────────────┐
│        STRIPE CHECKOUT        │
│  User enters payment details  │
└───────────────┬───────────────┘
                │
                │ Payment success
                ▼
        Stripe sends webhook -> POST /api/subscription/webhook
                │
                ▼
┌───────────────────────────────┐
│       BACKEND (Spring Boot)   │
│  SubscriptionController       │
│    .handleWebhook()           │
└───────────────┬───────────────┘
                │
                ▼
        SubscriptionService.handleWebhook()
        ├─ Webhook.constructEvent() (verify signature)
        ├─ handleCheckoutSessionCompleted()
        ├─ UserRepository.findByStripeCustomerId()
        └─ user.setSubscriptionStatus("ACTIVE")
                │
                ▼
┌───────────────────────────────┐
│    DATABASE (PostgreSQL)      │
│   users table (UPDATE status) │
└───────────────────────────────┘
```

## Steps (10)

1. User clicks "Subscribe" button in `frontend/src/components/paymentModal.tsx`.
2. `handleSubscribe()` retrieves JWT from `localStorage` and sends `POST /api/subscription/create-checkout`.
3. `SubscriptionController.createCheckoutSession()` receives the request (authenticated via JWT).
4. `SubscriptionService.createCheckoutSession()` checks if user has a Stripe customer ID.
5. If no customer ID exists, `Customer.create()` creates one in Stripe and saves it to the user.
6. `Session.create()` creates a Stripe Checkout Session with the subscription price.
7. Backend returns `{ url: checkoutUrl }` to the frontend.
8. Frontend redirects user to Stripe Checkout via `window.location.href`.
9. User completes payment on Stripe's hosted checkout page.
10. Stripe sends `checkout.session.completed` webhook to `/api/subscription/webhook`.
11. `SubscriptionService.handleWebhook()` verifies the signature and updates user's `subscriptionStatus` to `ACTIVE`.

## Webhook Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handleCheckoutSessionCompleted()` | Set status to `ACTIVE`, save subscription ID |
| `customer.subscription.updated` | `handleSubscriptionUpdated()` | Update status (`ACTIVE`, `PAST_DUE`, `CANCELLED`) and dates |
| `customer.subscription.deleted` | `handleSubscriptionDeleted()` | Set status to `EXPIRED` |

## Configuration Required

In `application.properties`:
```properties
stripe.secret-key=sk_test_xxx
stripe.webhook-secret=whsec_xxx
stripe.price-id=price_xxx
stripe.success-url=http://localhost:3000/subscription/success
stripe.cancel-url=http://localhost:3000/subscription/cancel
```

## Notes
- JWT authentication is required for the `/create-checkout` endpoint.
- The `/webhook` endpoint is public but verified via Stripe signature.
- Stripe customer ID is stored in the `users` table to link payments to users.
- Subscription status values: `ACTIVE`, `PAST_DUE`, `CANCELLED`, `EXPIRED`.
