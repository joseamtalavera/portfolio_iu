# Test Plan — BeWorking

This document lists **what I test, at which level, and why**. I wrote it before writing the
tests, so I decided what to cover on purpose instead of testing things at random.

For the step-by-step manual walkthrough of the running application, see
[`MANUAL_WALKTHROUGH.md`](./MANUAL_WALKTHROUGH.md).

---

## 1. What we test, and what we deliberately do not

The rule I follow: **test the things that would be a bug if they broke.**

In practice that means business rules and security boundaries. It explicitly excludes:

| Not tested | Why |
|---|---|
| Getters, setters, Lombok builders | Generated code; a failure here is a compiler failure |
| Spring wiring, JPA query execution | Framework code, already tested by its authors |
| Third-party libraries (BCrypt, JJWT, Stripe SDK) | We use them because they are already well tested |
| Layout and styling | Any assertion here would break on every design change |

Testing those would raise the coverage number without catching any real bug, so I leave them
out on purpose. This table is why.

### Convention for every test

Fixed, applied without exception:

```java
@Test
@DisplayName("create rejects an end hour that is before the start hour")
void createRejectsEndBeforeStart() {   // TEST_PLAN B1
```

- **`@DisplayName`** says what the test checks in plain English, right in the code, so you can
  see it without reading the assertions.
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
| **Slice** *(deferred — see §3.3)* | `@WebMvcTest` + MockMvc | HTTP contract: status codes, `@Valid` rejections, endpoints require a token. | ~1s |
| **Integration** | `@SpringBootTest` | The parts are wired together and the app starts. | slow |

Most of the tests are **unit** tests, because that is where the business rules are. Slice tests
would check status codes and validation (the HTTP side, which a unit test does not see), but I
**deferred** them (see §3.3). Only one integration test is needed, to check the app starts.

---

## 3. Backend automated coverage

### 3.1 Booking rules — `BookingServiceTest` (unit)

All eight live in `backend/src/test/java/com/beworking/backend/services/BookingServiceTest.java`,
each tagged with its `// TEST_PLAN B#`.

| # | Test | Rule protected | Expected |
|---|---|---|---|
| B1 | `createRejectsEndBeforeStart` | End must be after start | `400 Bad Request`, nothing saved |
| B2 | `createRejectsEqualStartAndEnd` | A zero-length booking is not a booking | `400 Bad Request` |
| B3 | `createRejectsOverlap` | No double booking | `409 Conflict`, nothing saved |
| B4 | `createSavesWhenSlotIsFree` | The happy path still works | Response carries the new id |
| B5 | `createAttachesCallerOwner` | Owner comes from the token, never the request body | Saved booking has the caller's id |
| B6 | `deleteRefusesBookingOwnedBySomeoneElse` | IDOR prevention | `403 Forbidden`, nothing deleted |
| B7 | `deleteRemovesOwnBooking` | The happy path still works | `delete` called with that booking |
| B8 | `deleteScopesLookupByCallerId` | Ownership travels in the `WHERE` clause | Repository queried with both ids |

Why B1 and B2 are separate: `isAfter` and `isBefore` only differ when start and end are equal,
so a wrong comparison could pass B1 but fail B2. That equal case is exactly what B2 checks.

Why B5 and B8 exist: they check a **security rule**, not a return value. They fail if someone
later changes the code to trust a user id sent by the client.

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

A4 is the most important auth test: the behaviour it checks is invisible in normal use, so
someone could break it by "making the error messages clearer" without noticing.

### 3.3 HTTP contract — `BookingControllerTest` (`@WebMvcTest`) — *deferred*

Planned file: `backend/src/test/java/com/beworking/backend/controllers/BookingControllerTest.java`
(not yet written).

| # | Test | Rule protected | Expected |
|---|---|---|---|
| C1 | `createRequiresAuthentication` | Default-deny in `SecurityConfig` | `401` with no token |
| C2 | `createRejectsBlankProduct` | `@NotBlank` | `400` |
| C3 | `createRejectsPastDate` | `@FutureOrPresent` | `400` |
| C4 | `createRejectsZeroAttendees` | `@Min(1)` | `400` |
| C5 | `createReturns201WithLocationOfNewBooking` | Correct success status | `201`, body carries the id |
| C6 | `deleteReturns204` | Correct success status | `204`, empty body |

C1 matters most: it checks the whole security chain, not just one class.

**Why these are deferred.** At this size I put the automated effort into unit tests, which is where
the business rules are. The HTTP checks above (401 without a token, the `@Valid` 400s, past-date
and zero-attendee rejections) are all exercised by the manual cases (M03, M08, M13, M14), so nothing
here is untested — it is just checked by hand rather than by `@WebMvcTest`. Turning these C-cases into
real slice tests is the obvious next step if the suite grows.

### 3.4 Context — `BackendApplicationTests` (integration) — *exists*
It lives in `backend/src/test/java/com/beworking/backend/BackendApplicationTests.java` — the
default Spring Boot smoke test, so it has no `// TEST_PLAN` tag of its own.

| # | Test | Proves |
|---|---|---|
| I1 | `contextLoads` | Every bean can be constructed; no circular or missing dependency |

---

## 4. Frontend

The application has four features. The two the brief requires as **dynamic** — authentication and
booking — are covered by **automated component tests**; mailbox is covered by a **manual acceptance
case** (M19) in section 5, and payment is **checked by hand in Stripe test mode** (see §4.4). I put
the automated tests on the two dynamic features, since those are the ones being assessed; payment
works but is a separate feature, so I test it by hand instead.

Tooling: **Vitest + React Testing Library** (the runner Next.js documents for React 19). A component
test renders a single component in a jsdom DOM, simulates a user action, and asserts what the user
would see — no real browser and no real backend.

### 4.1 Auth component tests — landing/register page and login page

The register form is part of the landing page (`app/page.tsx`); login is its own page
(`app/login/page.tsx`). F1–F2 live in `frontend/src/app/page.test.tsx` and F3–F4 in
`frontend/src/app/login/page.test.tsx`, each tagged with its `// TEST_PLAN F#`.

| # | Test | Rule protected | Where |
|---|---|---|---|
| F1 | Register form blocks submit and shows a field error for a too-short password (passing) | The client mirrors the server's `@Size(min = 6)` rule before a round trip | `frontend/src/app/page.test.tsx` |
| F2 | Register form submits when the details are valid (passing) | The happy path reaches the API | `frontend/src/app/page.test.tsx` |
| F3 | Login form shows "Invalid credentials" on a rejected login, without crashing (passing) | The server's `401` meaning survives to the screen | `frontend/src/app/login/page.test.tsx` |
| F4 | Login form submits when credentials are filled in (passing) | The happy path reaches the API | `frontend/src/app/login/page.test.tsx` |

### 4.2 Booking component test — bookings page

The booking form lives on the bookings page (`app/bookings/page.tsx`). Three client behaviours are
covered here: F5 asserts the End Hour dropdown only offers slots later than the chosen Start Hour,
F6 asserts the client blocks an overlapping slot before any request is sent, and F7 asserts that
when the server rejects a create, its error message is shown in the banner. All live in
`frontend/src/app/bookings/page.test.tsx`, each tagged with its `// TEST_PLAN F#`.

| # | Test | Rule protected | Where |
|---|---|---|---|
| F5 | After a Start Hour is chosen, the End Hour dropdown lists only later slots — an end ≤ start cannot be selected | The client enforces end > start in the UI, not only on the backend | `frontend/src/app/bookings/page.test.tsx` |
| F6 | Choosing a slot that overlaps an existing booking opens the "Time Slot Already Booked" dialog, before any request is sent | The client blocks a double booking and says so, without a wasted round trip | `frontend/src/app/bookings/page.test.tsx` |
| F7 | When a create request fails, the banner shows the server's message (not a raw JSON body or a generic fallback) | The server's error reason survives to the screen | `frontend/src/app/bookings/page.test.tsx` |

**Why F5 is now a client test.** Originally both dropdowns drew from the same slot list, so an
end ≤ start *was* selectable — the resulting `400` came back as a generic "Failed to create
booking" alert, with the rule living only on the **backend** (B1, B2). F5 was retired then as
having no client behaviour to assert. The form was later changed: the End Hour dropdown is
filtered to slots strictly after the chosen Start (`endTimeOptions`), and a now-invalid end is
cleared when Start moves past it. Now the rule is real behaviour in the UI, so I brought F5 back
to check it. The backend (B1, B2) is still the safety net.

**What F6 tests.** F6 checks the client's own double-booking block. When you pick a slot that
clashes with a booking already on screen, the app opens the "Time Slot Already Booked" dialog right
away: a local check (`checkForConflict`) runs first, so no request is even sent to the server.

**What F7 tests.** F7 checks the failure path. `fetch` is mocked so the create request comes back
with `ok:false` and a JSON body carrying a `message`; the test asserts that exact message reaches
the error banner. It does not test any specific rule (overlap, end-before-start) — those are the
backend's job (B1–B3) — only that whatever reason the server sends is displayed, rather than the
raw JSON that used to appear.

The test sets this up directly — it loads one existing booking (10:30–11:30, via a mocked `fetch`),
fills the form with an overlapping 10:00–11:30, clicks Create, and checks the dialog appears.

One clarification, because it is easy to get wrong: the dialog does **not** come from the server's
`409`. The client blocks the clash first, so the server is usually never called. A `409` only
happens if that client check is bypassed, and then it shows as a plain error message, not this
dialog.

The same client behaviour is also checked by hand in M10 (blocks an overlap) and M11 (allows a
touching edge). The server's own overlap rule is covered by **B3**.

### 4.3 Validation unit tests — the shared validators (`auth.test.ts`)

Under the component tests are the plain functions they use: `validateRegister` and
`validateLogin`. I test these on their own — no DOM, no render — because a validator is a plain
function and each branch can be checked with one input. F1–F4 check that the form *wires* the
validator to the screen; V1–V7 check the validator itself. All seven live in
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

### 4.4 Checked by hand — mailbox and payment

I test mailbox by hand in case M19.

Payment is a working feature, but it is **not** one of the two dynamic features I was asked to build
(those are login and booking), so I did not write automated tests for it. It is also not needed to
review those two features: the tutor account is already active, so it can book and open the mailbox
without paying.

Payment only comes in if you register a brand-new user. A new user starts **inactive**, so before
they can book or open the mailbox they have to pay. To try that path you first add your own Stripe
test keys to the backend (see [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) and the README), then pay
with Stripe's test card. That is why I check payment by hand in Stripe test mode instead of
automating it.

---

## 5. Manual acceptance cases

The table below is the "click this, expect that" set.

| ID | Area | Precondition | Action | Expected result |
|---|---|---|---|---|
| M01 | Register | No account for `test@example.com` | Submit the register form with valid details | Account created, redirected to login, **no** token issued |
| M02 | Register | `test@example.com` already exists | Submit the same email again | Error "Email already exists"; no second account |
| M03 | Register | — | Submit a password shorter than 6 characters | Field-level error; the form does not submit |
| M04 | Login | Account exists | Submit correct email and password | Redirected to the dashboard; token stored client-side |
| M05 | Login | Account exists | Submit the correct email with a wrong password | "Invalid credentials" |
| M06 | Login | No such account | Submit an unknown email | **Identical** message and status to M05 |
| M07 | Access control | Logged out | Open `/dashboard` directly by URL | Redirected to login, no data shown |
| M08 | Access control | Logged in | Call `GET /api/bookings` with the `Authorization` header removed | `401 Unauthorized` |
| M09 | Booking | Logged in | Create a booking for tomorrow, 09:00–11:00 | Booking appears in the list; `201` returned |
| M10 | Booking | M09 done | Create the same room, same date, 10:00–12:00 | The "Time Slot Already Booked" dialog appears (client's local check); no request is sent, no booking created |
| M11 | Booking | M09 done | Create the same room, same date, 11:00–12:00 | **Accepted** — touching edges do not overlap |
| M12 | Booking | Logged in | Pick Start 17:00, then open the End Hour dropdown | The dropdown offers no slot ≤ 17:00, so end-before-start cannot be chosen in the UI. Called directly (bypassing the form), the API still rejects it with `400` |
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

M11, M16 and M18 are the three worth showing live. M11 shows the overlap check is off-by-one
correct, not just present; M16 and M18 together show a refusal does not reveal whether the
booking exists.

---

## 6. Known gaps

| Gap | Why it is not covered | Correct fix |
|---|---|---|
| Concurrent double booking | Two simultaneous requests can both pass the overlap check before either writes. A unit test with mocks cannot reproduce it. | A PostgreSQL exclusion constraint, which requires versioned database migrations first |
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
| `BookingControllerTest` | Deferred — section 3.3. The HTTP checks these would automate are covered by the manual cases (M03, M08, M13, M14) for now; writing them as slice tests is the next step if the suite grows |
| Frontend validators (`utils/auth.test.ts`) | Complete — V1–V7 written and passing (section 4.3) |
| Frontend auth components (`app/page.test.tsx`, `app/login/page.test.tsx`) | Complete — F1–F4 written and passing |
| Frontend booking component (`app/bookings/page.test.tsx`) | Complete — F5, F6 and F7 written and passing (section 4.2) |

Run the backend suite with:

```bash
cd backend && ./mvnw test
```
