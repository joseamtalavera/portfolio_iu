# UI Testing Script

## Step-by-Step Test Script

### 1. Register a New User

1. Open **http://localhost:3000** in your browser
2. Fill in the registration form:
   - **Name**: `Test User`
   - **Email**: `test@example.com`
   - **Password**: `test1234`
3. Click **"Register"** button
4. You should be redirected to the login page

### 2. Login

1. On the login page, enter:
   - **Email**: `test@example.com`
   - **Password**: `test1234`
2. Click **"Login"** button
3. You should be redirected to the **Dashboard**

### 3. Explore the Dashboard

1. **Dashboard** should display:
   - User stats (name, email, subscription status)
   - Total bookings count
   - Total mailbox items count
   - Subscription status chip (should show **INACTIVE** in orange)
2. Check the navigation sidebar on the left:
   - Dashboard
   - Bookings
   - Mailbox
   - Profile

### 4. Test Mailbox

1. Click **Mailbox** in the sidebar
2. You should see a list of mailbox items (default tutor user has 5 items)
3. Each item shows:
   - Subject
   - Message preview
   - Timestamp
   - PDF download link
4. Click a PDF link to verify it opens/downloads

### 5. Create a Booking

1. Click **Bookings** in the sidebar
2. You should see a calendar view and a form to create bookings
3. Fill in the booking form:
   - **Product**: Meeting Room A
   - **Date**: select a future date (use the date picker)
   - **Start Hour**: 10:00
   - **End Hour**: 11:30
   - **Attendees**: 5
4. Click **"Create Booking"** button
5. The booking should appear in the list below the form

### 6. View Bookings List

1. Scroll down on the Bookings page
2. You should see all your bookings listed
3. Each booking shows:
   - Product name
   - Date
   - Time range
   - Number of attendees
4. Try deleting a booking by clicking the delete (trash) icon

### 7. Update Profile

1. Click **Profile** in the sidebar (or click your name/avatar in the top right)
2. A profile modal should open
3. Update fields:
   - **Name**: Updated Name
   - **Phone**: +34 612 345 678
   - **Company**: My Company
4. Click **"Save"** button
5. The changes should be reflected in the dashboard

### 8. Test Responsive Design

1. Open browser Developer Tools (F12 or Cmd+Option+I)
2. Click the Device Toolbar icon (or press Cmd+Shift+M / Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. Verify:
   - Navigation sidebar collapses to a hamburger menu
   - Forms stack vertically
   - Text sizes adjust
   - Buttons remain clickable

### 9. Test Logout

1. Click your name/avatar in the top right
2. Click **"Logout"** button
3. You should be redirected to the login page
4. Try accessing http://localhost:3000/dashboard directly — you should be redirected to login

### 10. Test with Default Tutor User

Login with:
- **Email**: `tutor@be-working.com`
- **Password**: `tutor1234`

This user already has 5 mailbox items pre-loaded. Verify the mailbox shows all 5 items.
