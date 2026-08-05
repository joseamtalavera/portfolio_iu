# API Reference (Testing)

All API endpoints are prefixed with `/api`. Base URL: `http://localhost:8081/api`

## Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required (public)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

Registration returns only a status message and the new user's id — no token. The
user logs in as a separate step to obtain a JWT.

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### 2. Login User

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required (public)

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "company": null,
    "billingAddress": null,
    "billingCity": null,
    "billingCountry": null,
    "billingPostalCode": null,
    "subscriptionStatus": "INACTIVE"
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Save the token** from the response for authenticated requests below.

---

## Protected Endpoints (Require JWT Token)

All endpoints below require the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-token-here>
```

### 3. Get Current User Profile

**Endpoint**: `GET /api/user/me`

**Authentication**: Required (Bearer token)

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": null,
  "company": null,
  "billingAddress": null,
  "billingCity": null,
  "billingCountry": null,
  "billingPostalCode": null,
  "subscriptionStatus": "INACTIVE"
}
```

**cURL Command:**
```bash
curl http://localhost:8081/api/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 4. Get Mailbox Items

**Endpoint**: `GET /api/mailbox`

**Authentication**: Required (Bearer token)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "subject": "Welcome to BeWorking",
    "message": "Your virtual office is set up. Explore the dashboard to get started.",
    "timestamp": "2025-01-15T10:00:00",
    "pdfUrl": "http://localhost:8081/pdfs/mail-1.pdf"
  },
  {
    "id": 2,
    "subject": "Booking reminder",
    "message": "Don't forget your meeting room booking tomorrow at 10:00.",
    "timestamp": "2025-01-15T22:00:00",
    "pdfUrl": "http://localhost:8081/pdfs/mail-2.pdf"
  }
]
```

**cURL Command:**
```bash
curl http://localhost:8081/api/mailbox \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 5. Create Booking

**Endpoint**: `POST /api/bookings`

**Authentication**: Required (Bearer token)

**Request Body:**
```json
{
  "product": "Meeting Room A",
  "date": "2025-01-20",
  "startHour": "10:00:00",
  "endHour": "11:30:00",
  "attendees": 5
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "product": "Meeting Room A",
  "date": "2025-01-20",
  "startHour": "10:00:00",
  "endHour": "11:30:00",
  "attendees": 5
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "product": "Meeting Room A",
    "date": "2025-01-20",
    "startHour": "10:00:00",
    "endHour": "11:30:00",
    "attendees": 5
  }'
```

---

### 6. Get All Bookings

**Endpoint**: `GET /api/bookings`

**Authentication**: Required (Bearer token)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "product": "Meeting Room A",
    "date": "2025-01-20",
    "startHour": "10:00:00",
    "endHour": "11:30:00",
    "attendees": 5
  },
  {
    "id": 2,
    "product": "Desk 42",
    "date": "2025-01-21",
    "startHour": "09:00:00",
    "endHour": "17:00:00",
    "attendees": 1
  }
]
```

**cURL Command:**
```bash
curl http://localhost:8081/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 7. Delete Booking

**Endpoint**: `DELETE /api/bookings/{bookingId}`

**Authentication**: Required (Bearer token)

**Response (204 No Content)** - Empty body on success

**cURL Command:**
```bash
curl -X DELETE http://localhost:8081/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 8. Update User Profile

**Endpoint**: `PUT /api/user/profile`

**Authentication**: Required (Bearer token)

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+34 612 345 678",
  "company": "My Company",
  "billingAddress": "123 Main St",
  "billingCity": "Málaga",
  "billingCountry": "Spain",
  "billingPostalCode": "29001"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Updated",
  "email": "john@example.com",
  "phone": "+34 612 345 678",
  "company": "My Company",
  "billingAddress": "123 Main St",
  "billingCity": "Málaga",
  "billingCountry": "Spain",
  "billingPostalCode": "29001",
  "subscriptionStatus": "INACTIVE"
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:8081/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "+34 612 345 678",
    "company": "My Company"
  }'
```

---

## Subscription Endpoints (Stripe)

Stripe runs **server-side only**. No secret key ships in the repository; the
backend reads `stripe.secret-key`, `stripe.price-id` and `stripe.webhook-secret`
from `backend/.env`. With those unset, both endpoints return `500` and the rest of
the API is unaffected.

### 9. Create Checkout Session

**Endpoint**: `POST /api/subscription/create-checkout`

**Authentication**: Required (Bearer token)

**Request Body**: none — the user is taken from the JWT.

**Response (200 OK):**
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3..."
}
```
The frontend redirects the browser to this URL. Returns `500` if Stripe keys are
not configured.

**cURL Command:**
```bash
curl -X POST http://localhost:8081/api/subscription/create-checkout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 10. Stripe Webhook

**Endpoint**: `POST /api/subscription/webhook`

**Authentication**: Not required (public) — the caller is Stripe, not a user. Trust
comes from the `Stripe-Signature` header, verified against `stripe.webhook-secret`;
an invalid signature returns `400`.

**Request Body**: the raw Stripe event JSON (sent by Stripe, not by clients).

**Handled events:**

| Event | Effect on the user |
|-------|--------------------|
| `checkout.session.completed` | `subscriptionStatus` → `ACTIVE` |
| `customer.subscription.updated` | → `ACTIVE` / `PAST_DUE` / `CANCELLED` |
| `customer.subscription.deleted` | → `EXPIRED` |

**Response (200 OK):** `Webhook processed successfully`

---

## Default Test User

For quick testing, you can use the pre-created user:

- **Email**: `tutor@be-working.com`
- **Password**: `tutor1234`

This user already has 5 mailbox items pre-loaded.
