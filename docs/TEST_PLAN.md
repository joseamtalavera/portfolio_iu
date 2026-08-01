# Test Plan — BeWorking

This document states **what is tested, at which level, and why**. It is written before the
tests so that coverage is a decision rather than an accident.

For the step-by-step manual walkthrough of the running application, see
[`MANUAL_WALKTHROUGH.md`](./MANUAL_WALKTHROUGH.md).

---

## 1. What we test, and what we deliberately do not

The rule applied throughout: **test what would be a bug if it broke.**

In practice that means business rules and security boundaries. It explicitly excludes:

| Not tested | Why |
|---|---|
| Getters, setters, Lombok builders | Generated code; a failure here is a compiler failure |
| Spring wiring, JPA query execution | Framework code, already tested by its authors |
| Third-party libraries (BCrypt, JJWT, Stripe SDK) | Trusting them is the reason for using them |
| Layout and styling | No assertion exists that would not break on every design change |

Writing tests for those inflates a coverage number without protecting anything. Leaving them
out is the decision; this table is the justification.

### Convention for every test

Fixed, applied without exception:

```java
@Test
@DisplayName("create rejects an end hour that is before the start hour")
void createRejectsEndBeforeStart() {   // TEST_PLAN B1
```

- **`@DisplayName`** states the rule in plain English, in the code itself. A reader learns what
  is protected without reading the assertions.
- **The `TEST_PLAN` id in a trailing comment** ties the test to its row in the tables below, so
  the plan and the suite cannot drift apart.
- **Method names describe behaviour, not mechanics** — `createRejectsEndBeforeStart`, never
  `testCreateBooking1`.
- **Arrange / act / assert order**, with a blank line between the three parts.
- **A rejection test asserts two things**: that it threw with the right status, *and* that
  nothing was written — `verify(repository, never()).save(any())`. A test that only checks the
  exception still passes if the code throws after saving.

---

## 2. The three levels

| Level | Tool | What it proves | Speed |
|---|---|---|---|
| **Unit** | JUnit 5 + Mockito | A business rule behaves correctly in isolation. Repository mocked, no database. | ms |
| **Slice** | `@WebMvcTest` + MockMvc | HTTP contract: status codes, `@Valid` rejections, endpoints require a token. | ~1s |
| **Integration** | `@SpringBootTest` | The parts are wired together and the app starts. | slow |

Most value sits at the **unit** level, because that is where the rules live. Slice tests exist
because status codes and validation are part of the API contract and are not visible to a unit
test. Only one integration test is needed — proving the context loads.

---

## 3. Backend automated coverage

### 3.1 Booking rules — `BookingServiceTest` (unit)

| # | Test | Rule protected | Expected |
|---|---|---|---|
| B1 | `createRejectsEndBeforeStart` | End must be after start (F26) | `400 Bad Request`, nothing saved |
| B2 | `createRejectsEqualStartAndEnd` | A zero-length booking is not a booking | `400 Bad Request` |
| B3 | `createRejectsOverlap` | No double booking (F25) | `409 Conflict`, nothing saved |
| B4 | `createSavesWhenSlotIsFree` | The happy path still works | Response carries the new id |
| B5 | `createAttachesCallerAsOwner` | Owner comes from the token, never the request body | Saved booking has the caller's id |
| B6 | `deleteRefusesBookingOwnedBySomeoneElse` | IDOR prevention | `403 Forbidden`, nothing deleted |
| B7 | `deleteRemovesOwnBooking` | The happy path still works | `delete` called with that booking |
| B8 | `deleteScopesLookupByCallerId` | Ownership travels in the `WHERE` clause | Repository queried with both ids |

Why B1 and B2 are separate: `isAfter` and `isBefore` differ only when the two values are equal,
so an off-by-one in the comparison passes B1 and fails B2. That boundary is the whole point.

Why B5 and B8 exist at all: they assert a **security property**, not an output. They fail if a
future refactor starts trusting a client-supplied user id.

### 3.2 Authentication rules — `AuthServiceTest` (unit)

All five live in `backend/src/test/java/com/beworking/backend/services/AuthServiceTest.java`,
each tagged with its `// TEST_PLAN A#`.

| # | Test | Rule protected | Expected |
|---|---|---|---|
| A1 | `registerRejectsDuplicateEmail` | One account per email | `400`, no second row saved |
| A2 | `registerStoresHashNeverPlaintext` | The raw password is never persisted | `save` receives the encoded value, not the typed password |
| A3 | `loginReturnsTokenForValidCredentials` | The happy path | Non-empty JWT returned |
| A4 | `loginRejectsWrongPasswordWithSameMessageAsUnknownEmail` | No user enumeration | Identical `401` and identical message in both cases |
| A5 | `loginResponseNeverCarriesThePasswordField` | The DTO boundary holds | `UserResponse` has no password component |

A4 is the highest-value test in the suite: it protects a property that is invisible in normal
use and would be silently destroyed by a well-meaning "clearer error messages" change.

### 3.3 HTTP contract — `BookingControllerTest` (`@WebMvcTest`) — *deferred*

Planned file: `backend/src/test/java/com/beworking/backend/controllers/BookingControllerTest.java`
(not yet written — see the deferral note below).

| # | Test | Rule protected | Expected |
|---|---|---|---|
| C1 | `createRequiresAuthentication` | Default-deny in `SecurityConfig` | `401` with no token |
| C2 | `createRejectsBlankProduct` | `@NotBlank` | `400` |
| C3 | `createRejectsPastDate` | `@FutureOrPresent` | `400` |
| C4 | `createRejectsZeroAttendees` | `@Min(1)` | `400` |
| C5 | `createReturns201WithLocationOfNewBooking` | Correct success status | `201`, body carries the id |
| C6 | `deleteReturns204` | Correct success status | `204`, empty body |

C1 is the one that matters most: it proves the *whole* security chain, not one class.

### 3.4 Context — `BackendApplicationTests` (integration) — *exists*

| # | Test | Proves |
|---|---|---|
| I1 | `contextLoads` | Every bean can be constructed; no circular or missing dependency |

---

## 4. Frontend

The application has four features. The two the brief requires as **dynamic** — authentication and
booking — are covered by **automated component tests**; mailbox and payment are covered by the
**manual acceptance cases** in section 5. This mirrors where the marks and the risk actually sit:
the automated tests exercise the flows shown in the screencast, and payment is deliberately manual
because Stripe is an external service tested against its sandbox rather than automated.

Tooling: **Vitest + React Testing Library** (the runner Next.js documents for React 19). A component
test renders a single component in a jsdom DOM, simulates a user action, and asserts what the user
would see — no real browser and no real backend.

### 4.1 Auth component tests — landing/register page and login page

The register form is part of the landing page (`app/page.tsx`); login is its own page
(`app/login/page.tsx`). Each test carries a `// TEST_PLAN F#` tag, so the row and the code
can be found from either direction.

| # | Test | Rule protected | Where |
|---|---|---|---|
| F1 | Register form blocks submit and shows a field error for a too-short password (passing) | The client mirrors the server's `@Size(min = 6)` rule before a round trip | `frontend/src/app/page.test.tsx` |
| F2 | Register form submits when the details are valid (passing) | The happy path reaches the API | `frontend/src/app/page.test.tsx` |
| F3 | Login form shows "Invalid credentials" on a rejected login, without crashing (passing) | The server's `401` meaning survives to the screen | `frontend/src/app/login/page.test.tsx` |
| F4 | Login form submits when credentials are filled in (passing) | The happy path reaches the API | `frontend/src/app/login/page.test.tsx` |

### 4.2 Booking component test — bookings page

The booking form lives on the bookings page (`app/bookings/page.tsx`). It was **planned** as two
tests (F5, F6); after reading the implementation, F5 was retired and F6 was rewritten to match the
code the page actually runs — testing behaviour that does not exist would be dishonest coverage.

| # | Test | Rule protected | Where |
|---|---|---|---|
| F6 | Choosing a slot that overlaps an existing booking opens the "Time Slot Already Booked" dialog, before any request is sent | The client blocks a double booking and says so, without a wasted round trip | `frontend/src/app/bookings/page.test.tsx` |

**Why F5 was retired.** F5 was to assert the client blocks an end ≤ start choice. There is no such
client check: start and end are *dropdowns* filled only with valid, available half-hour slots, so
an end-before-start choice is not selectable in the first place. That rule is enforced and tested
on the **backend** (B1, B2).

**What F6 really tests.** The original F6 assumed a `409` from the API renders "already booked". In
fact the dialog is produced by a *local* overlap check (`checkForConflict`) that runs **before** any
request; a real `409` would surface as a generic alert. So F6 now drives the true path: it seeds one
existing booking (10:30–11:30 via a mocked `fetch`), fills the form with an overlapping 10:00–11:30,
clicks Create, and asserts the conflict dialog appears. Server-side overlap is separately covered by
**B3** and the manual cases (M10, M11).

### 4.3 Validation unit tests — the shared validators (`auth.test.ts`)

Beneath the component tests sit the pure functions they depend on: `validateRegister` and
`validateLogin`. These are tested in isolation — no DOM, no render — because a validator is a
plain function whose every branch can be pinned with one input. F1–F4 prove the form *wires* the
validator to the screen; V1–V7 prove the validator itself is correct. All seven live in
`frontend/src/utils/auth.test.ts`, each tagged with its `// TEST_PLAN V#`.

| # | Test | Rule protected | Expected |
|---|---|---|---|
| V1 | `validateRegister` rejects a password shorter than 6 chars | Mirrors the server's `@Size(min = 6)` | `"Password must be at least 6 characters"` |
| V2 | `validateRegister` accepts valid input | The happy path returns no error | `null` |
| V3 | `validateRegister` rejects an empty name | Name is required | `"Name is required"` |
| V4 | `validateRegister` rejects an email without `@` | Basic email shape | `"Invalid email address"` |
| V5 | `validateLogin` rejects an email without `@` | Basic email shape | `"Invalid email address"` |
| V6 | `validateLogin` rejects an empty password | Password is required | `"Password is required"` |
| V7 | `validateLogin` accepts valid input | The happy path returns no error | `null` |

### 4.4 Deliberately manual — mailbox and payment

Mailbox and payment are exercised through the manual cases (M19 for mailbox; the payment flow in the
screencast against the Stripe sandbox). Automating payment is intentionally out of scope: faking the
full Stripe lifecycle, including webhooks, is brittle and low-value at this size.

Also deliberately excluded everywhere: snapshot tests of rendered markup. They break on every styling
change and assert nothing about behaviour.

---

## 5. Manual acceptance cases

The table below is the "click this, expect that" set.

| ID | Area | Precondition | Action | Expected result |
|---|---|---|---|---|
| M01 | Register | No account for `test@example.com` | Submit the register form with valid details | Account created, redirected to login, **no** token issued |
| M02 | Register | `test@example.com` already exists | Submit the same email again | Error "email already registered"; no second account |
| M03 | Register | — | Submit a password shorter than 6 characters | Field-level error; the form does not submit |
| M04 | Login | Account exists | Submit correct email and password | Redirected to the dashboard; token stored client-side |
| M05 | Login | Account exists | Submit the correct email with a wrong password | "Invalid credentials" |
| M06 | Login | No such account | Submit an unknown email | **Identical** message and status to M05 |
| M07 | Access control | Logged out | Open `/dashboard` directly by URL | Redirected to login, no data shown |
| M08 | Access control | Logged in | Call `GET /api/bookings` with the `Authorization` header removed | `401 Unauthorized` |
| M09 | Booking | Logged in | Create a booking for tomorrow, 09:00–11:00 | Booking appears in the list; `201` returned |
| M10 | Booking | M09 done | Create the same room, same date, 10:00–12:00 | Rejected, `409`, message "already booked" |
| M11 | Booking | M09 done | Create the same room, same date, 11:00–12:00 | **Accepted** — touching edges do not overlap |
| M12 | Booking | Logged in | Create a booking with end 09:00 and start 17:00 | Rejected, `400`, "end hour must be after start hour" |
| M13 | Booking | Logged in | Create a booking dated yesterday | Rejected by `@FutureOrPresent` |
| M14 | Booking | Logged in | Create a booking with 0 attendees | Rejected by `@Min(1)` |
| M15 | Booking | Two accounts, each with a booking | As user A, list bookings | Only A's bookings are returned |
| M16 | Booking | Two accounts; B owns booking id *n* | As user A, `DELETE /api/bookings/{n}` | `403 Forbidden`; B's booking still exists |
| M17 | Booking | A owns booking id *n* | As user A, `DELETE /api/bookings/{n}` | `204 No Content`; the booking disappears from the list |
| M18 | Booking | — | `DELETE` a booking id that does not exist | `403` — **the same** as M16, so existence is not revealed |
| M19 | Mailbox | Demo account | Open Mailbox | Only that user's items are listed |
| M20 | Profile | Logged in | Open Profile | Email and name shown; **no password field is present anywhere in the response** |
| M21 | Session | Logged in | Wait past token expiry, then act | Redirected to login rather than a silent failure |
| M22 | Token | Logged in | Alter one character of the stored token, then reload | `401`; the forged token is rejected |

M11, M16 and M18 are the three worth demonstrating live. M11 proves the overlap boundary is
correct rather than merely present; M16 and M18 together prove that a refusal reveals nothing.

---

## 6. Known gaps, stated rather than hidden

| Gap | Why it is not covered | Correct fix |
|---|---|---|
| Concurrent double booking | Two simultaneous requests can both pass the overlap check before either writes. A unit test with mocks cannot reproduce it. | A PostgreSQL exclusion constraint, which requires versioned migrations first (F12) |
| No load or performance testing | Out of scope for the brief | JMeter or k6 against the booking endpoint |
| No end-to-end browser tests | Cost outweighs value at this size; the manual cases above cover the same paths | Playwright, if the project grew |

---

## 7. Current status

**14 automated backend tests currently pass** (B1–B8, A1–A5, I1).

| Suite | State |
|---|---|
| `BackendApplicationTests` | Complete — I1 (`contextLoads`) passing |
| `BookingServiceTest` | Complete — B1–B8 written and passing |
| `AuthServiceTest` | Complete — A1–A5 written and passing |
| `BookingControllerTest` | Deferred — section 3.3. The rules these would cover are already proven by the unit tests and the manual cases; held back pending review feedback rather than duplicating coverage |
| Frontend validators (`utils/auth.test.ts`) | Complete — V1–V7 written and passing (section 4.3) |
| Frontend auth components (`app/page.test.tsx`, `app/login/page.test.tsx`) | Complete — F1–F4 written and passing |
| Frontend booking component (`app/bookings/page.test.tsx`) | Complete — F6 written and passing; F5 retired as a backend-covered rule (section 4.2) |

Run the backend suite with:

```bash
cd backend && ./mvnw test
```
