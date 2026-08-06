# Manual Walkthrough — exercising the running app

This is a by-hand test script for the running app (frontend **http://localhost:3000**,
backend **:8081**). It exercises the two dynamic features — **authentication** and
**booking** — plus mailbox, profile, and responsive design.

**About the two accounts.** The seeded tutor account (`tutor@be-working.com` / `tutor1234`)
is already **active**, so it can reach every page. A brand-new user you register is
**inactive**, so the app's subscription paywall intercepts Mailbox and Bookings for that user
(expected behaviour). Use the new user to demonstrate registration/login, and the **tutor**
account for the feature pages.

---

## Part A — Authentication (dynamic feature 1)

### 1. Register a new user

1. Open **http://localhost:3000**.
2. In the registration form on the landing page, enter:
   - **Full Name**: `Test User`
   - **Email Address**: `test@example.com`
   - **Password**: `test1234`
3. Click **Register**.
4. A *"Registration successful! Redirecting to login…"* message appears and you are sent to
   the login page.

### 2. Log in

1. On the login page, enter `test@example.com` / `test1234`.
2. Click **Login** → you land on the **Overview** (dashboard).

### 3. Dashboard overview

1. The dashboard shows your name/email, a bookings count, a mailbox count, and a
   **subscription-status chip** — **INACTIVE** (orange) for this new user.
2. The sidebar contains: **Overview**, **Mailbox**, **Bookings**, **Profile**, **Log out**.
3. As an inactive user, clicking **Mailbox** or **Bookings** opens the **subscription paywall
   modal** instead of the page — this is the intended gate. To exercise those features, use the
   active tutor account in Part B.

### 4. Log out

1. Click **Log out** in the sidebar (left menu).
2. You are returned to the login page. Visiting **http://localhost:3000/dashboard** directly
   redirects to login.

---

## Part B — Feature tour with the active tutor account

### 5. Log in as the tutor

Log in with:
- **Email Address**: `tutor@be-working.com`
- **Password**: `tutor1234`

This account is **active**, so all pages are reachable (no paywall).

### 6. Mailbox

1. Click **Mailbox** in the sidebar.
2. You should see **5** pre-loaded messages. Each shows a subject, a message preview, a
   timestamp, and a PDF link.
3. Click a PDF link to verify it opens.

### 7. Create a booking (dynamic feature 2)

1. Click **Bookings** in the sidebar. The page opens on the **"calendar"** tab, which holds the
   booking form.
2. Fill in the form:
   - **Product**: `Meeting Room`
   - **Date**: a future date (use the date picker)
   - **Start Hour**: `10:00`
   - **End Hour**: `11:30`
   - **Attendees**: `5`
3. Click **Create Booking**. The booking is saved and the list refreshes.
   *(Booking the same room for an overlapping time is rejected — the backend returns `409`.)*

### 8. View / delete bookings

1. On the Bookings page, switch to the **"bookings"** tab to see your bookings list.
2. Each row shows the product, date, time range, and number of attendees.
3. Click the trash icon to delete a booking. *(You can only delete your own — the backend
   returns `403` otherwise.)*

### 9. Update profile

1. Click **Profile** in the sidebar, or click your **avatar** (top right) — both open the
   profile modal.
2. Update your **Name**, **Phone**, and **Company** (Email is shown but not editable).
3. Click **Save**. The changes are reflected on the dashboard.

### 10. Responsive design

1. Open browser DevTools (F12 or Cmd+Option+I) and toggle the device toolbar
   (Cmd+Shift+M / Ctrl+Shift+M).
2. Select a mobile device (e.g., iPhone 12) and verify:
   - The sidebar collapses to a hamburger menu
   - Forms stack vertically
   - Content stays readable and buttons remain tappable
