# BeWorking – Virtual Office Platform

A full-stack web application for freelancers and small businesses to manage their virtual office operations, including mailbox, bookings, and subscription management.

---

## 1. Project Overview

### What the App Does

BeWorking is a **Virtual Office Platform** that provides:

- **User Registration & Authentication**: Secure JWT-based authentication system
- **Dashboard**: Overview of bookings, mailbox items, and subscription status
- **Mailbox**: View and manage incoming messages with PDF attachments
- **Bookings**: Create, view, and manage meeting room and desk bookings
- **Subscription Management**: Stripe integration for subscription payments (optional)

### Tech Stack

- **Frontend**: Next.js 16.0.8 (App Router) + React 19.2.1 + Material-UI (MUI) 7.3.6
- **Backend**: Java 17 + Spring Boot 3.5.8 + Maven
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Processing**: Stripe (optional, for subscription features)

---

## 2. Repository Structure

```
portfolio_iu/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/beworking/backend/
│   │   │   │   ├── controllers/    # REST API endpoints
│   │   │   │   ├── services/       # Business logic
│   │   │   │   ├── entities/       # JPA entities (User, Booking, MailboxItem)
│   │   │   │   ├── repositories/   # Data access layer
│   │   │   │   ├── dto/            # Data Transfer Objects
│   │   │   │   ├── security/       # JWT authentication & Spring Security config
│   │   │   │   └── config/         # Application configuration
│   │   │   └── resources/
│   │   │       ├── application.properties  # Backend configuration
│   │   │       ├── data.sql                # Initial data (tutor user + mailbox items)
│   │   │       └── static/pdfs/            # PDF files for mailbox
│   │   └── test/                  # Unit tests
│   └── pom.xml                   # Maven dependencies
│
├── frontend/                     # Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   │   ├── page.tsx          # Landing/Registration page
│   │   │   ├── login/            # Login page
│   │   │   ├── dashboard/        # Dashboard page
│   │   │   ├── mailbox/          # Mailbox page
│   │   │   ├── bookings/         # Bookings page
│   │   │   └── subscription/     # Stripe success/cancel pages
│   │   ├── components/           # Reusable React components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── FrontLayout.tsx
│   │   │   └── ...
│   │   ├── utils/                # Utility functions (auth, time parsing)
│   │   ├── config/               # Configuration (API_URL, Stripe keys)
│   │   ├── theme.ts              # Material-UI theme configuration
│   │   └── types/                # TypeScript type definitions
│   ├── public/                   # Static assets (logos, icons, PDFs)
│   └── package.json              # Node.js dependencies
│
└── README.md                     # This file
```

---

## 3. Prerequisites

Before running the application, ensure you have the following installed:

### Required Software

1. **Node.js** (LTS version recommended: 18.x or 20.x)
   - Check: `node -v`
   - Download: https://nodejs.org/

2. **Java** (JDK 17 or higher)
   - Check: `java -version`
   - Download: https://adoptium.net/ (Temurin 17)

3. **Maven** (3.9+)
   - Check: `mvn -version`
   - Download: https://maven.apache.org/download.cgi

4. **PostgreSQL** (14+)
   - Check: `psql --version`
   - Download: https://www.postgresql.org/download/

5. **Git**
   - Check: `git --version`
   - Download: https://git-scm.com/downloads

### Installation Commands

**macOS (Homebrew):**
```bash
brew install node
brew install --cask temurin17
brew install maven
brew install postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y nodejs npm
sudo apt install -y openjdk-17-jdk
sudo apt install -y maven
sudo apt install -y postgresql-14 postgresql-contrib
```

**Windows (Chocolatey):**
```bash
choco install nodejs -y
choco install temurin17 -y
choco install maven -y
choco install postgresql14 -y
```

### Verify Installation

Run these commands to verify everything is installed:

```bash
node -v    # Should show v18.x.x or v20.x.x
npm -v     # Should show 9.x.x or 10.x.x
java -version  # Should show "openjdk version 17" or higher
mvn -version   # Should show Apache Maven 3.9.x or higher
psql --version # Should show PostgreSQL 14.x or higher
```

---

## 4. Environment Variables

### Frontend Environment Variables

The frontend uses environment variables prefixed with `NEXT_PUBLIC_` (these are exposed to the browser).

**Option 1: Create `.env.local` file** (recommended for local development)

Create a file at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_publishable_key_here
```

**Option 2: Use default values**

If you don't create `.env.local`, the frontend will use default values defined in `frontend/src/config/constants.ts`:
- `API_URL` defaults to `http://localhost:8081/api`
- `STRIPE_PUBLIC_KEY` defaults to a placeholder (Stripe is optional)

**Note**: The `.env.local` file should **NOT** be committed to Git (it's in `.gitignore`).

### Backend Configuration

The backend uses `application.properties` file (not `.env`).

**File location**: `backend/src/main/resources/application.properties`

**Configuration template:**

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/database_iu
spring.datasource.username=bework_user
spring.datasource.password=bework_pass
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Enable SQL initialization from data.sql
spring.sql.init.mode=always
spring.jpa.defer-datasource-initialization=true

# JWT Configuration
jwt.secret=ORZN4vIRih2qjNdYOs0VlfnBMDH9P2jTt4/1HL1MZR28jNtMlOYLFKlzl87pXx7tvuwIV7SemCgibcewuMsFPg==
jwt.expiration-ms=3600000

# Server Port
server.port=8081

# Stripe Configuration (Optional - leave empty if not using Stripe)
stripe.secret-key=
stripe.webhook-secret=
stripe.price-id=
stripe.success-url=http://localhost:3000/subscription/success
stripe.cancel-url=http://localhost:3000/subscription/cancel
```

**Important**: 
- Update the database credentials (`username`, `password`, `database name`) to match your PostgreSQL setup (see Database Setup section below).
- The JWT secret is already provided (for demo purposes). In production, generate a new secret.
- Stripe configuration is optional. Leave empty if you're not testing subscription features.

---

## 5. Database Setup (PostgreSQL)

### Step 1: Start PostgreSQL

**macOS:**
```bash
brew services start postgresql@14
# OR if using Postgres.app, just open the app
```

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
```

**Windows:**
- Start PostgreSQL service from Services panel, or use pgAdmin

### Step 2: Create Database and User

Open a terminal and connect to PostgreSQL:

```bash
psql -U postgres
```

Then run these SQL commands:

```sql
-- Create a user for the application
CREATE USER bework_user WITH PASSWORD 'bework_pass';

-- Create the database
CREATE DATABASE database_iu OWNER bework_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE database_iu TO bework_user;

-- Exit psql
\q
```

**Alternative (one-liner from terminal):**
```bash
psql -U postgres -c "CREATE USER bework_user WITH PASSWORD 'bework_pass';"
psql -U postgres -c "CREATE DATABASE database_iu OWNER bework_user;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE database_iu TO bework_user;"
```

### Step 3: Verify Database Connection

Test the connection:

```bash
psql -U bework_user -d database_iu -h localhost
```

If you can connect, type `\q` to exit.

### Step 4: Tables Creation

**Tables are created automatically** by Spring Boot using JPA/Hibernate:

- The `application.properties` file has `spring.jpa.hibernate.ddl-auto=update`, which means:
  - On first run, Spring Boot will create all tables based on the JPA entities (`User`, `Booking`, `MailboxItem`)
  - On subsequent runs, it will update the schema if entities change

**Initial Data:**

The `backend/src/main/resources/data.sql` file contains:
- A default user: `tutor@be-working.com` / password: `tutor1234`
- 5 sample mailbox items for the tutor user

This data is automatically loaded when the backend starts (because `spring.sql.init.mode=always` is set).

---

## 6. How to Run the Backend (Spring Boot)

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies and Build

```bash
mvn clean install
```

This will:
- Download all Maven dependencies
- Compile the Java code
- Run tests (if any)

**Note**: First run may take 2-5 minutes to download dependencies.

### Step 3: Run the Application

```bash
mvn spring-boot:run
```

You should see output like:

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.5.8)

...
Started BeWorkingApplication in X.XXX seconds
```

### Step 4: Verify Backend is Running

**Check the logs** for:
- `Started BeWorkingApplication` message
- No database connection errors
- Server running on port 8081

**Test with curl:**

```bash
curl http://localhost:8081/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'
```

If you get a response (even an error about email already existing), the backend is running!

**API Base URL**: `http://localhost:8081/api`

**Stop the backend**: Press `Ctrl+C` in the terminal where it's running.

---

## 7. How to Run the Frontend (Next.js)

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will download all Node.js packages (Next.js, React, Material-UI, etc.). First run may take 1-3 minutes.

### Step 3: Run the Development Server

```bash
npm run dev
```

You should see:

```
  ▲ Next.js 16.0.8
  - Local:        http://localhost:3000
  - Ready in X.XXs
```

### Step 4: Verify Frontend is Running

Open your browser and navigate to:

**http://localhost:3000**

You should see the BeWorking landing/registration page.

**Stop the frontend**: Press `Ctrl+C` in the terminal where it's running.

---

## 8. How to Run Both Together

### Recommended Startup Order

1. **Start PostgreSQL** (if not already running)
   ```bash
   # macOS
   brew services start postgresql@14
   
   # Ubuntu/Debian
   sudo systemctl start postgresql
   ```

2. **Start the Backend** (Terminal 1)
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Wait until you see: `Started BeWorkingApplication`

3. **Start the Frontend** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Wait until you see: `Ready in X.XXs`

4. **Open Browser**
   - Navigate to: **http://localhost:3000**

### Ports Used

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8081/api`
- **PostgreSQL**: `localhost:5432`

### Troubleshooting Port Conflicts

**If port 3000 is busy (frontend):**
```bash
# Find what's using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process, or change Next.js port:
npm run dev -- -p 3001
```

**If port 8081 is busy (backend):**
- Change `server.port=8081` to `server.port=8082` in `application.properties`
- Update `NEXT_PUBLIC_API_URL` in frontend `.env.local` to match

**If port 5432 is busy (PostgreSQL):**
- Check if PostgreSQL is already running: `psql -U postgres`
- If another PostgreSQL instance is running, stop it or use a different port

---

## 9. API Endpoints (for Testing)

All API endpoints are prefixed with `/api`. The base URL is: `http://localhost:8081/api`

### Authentication Endpoints

#### 1. Register User

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
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

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

#### 2. Login User

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

### Protected Endpoints (Require JWT Token)

All endpoints below require the JWT token in the `Authorization` header:

```
Authorization: Bearer <your-token-here>
```

#### 3. Get Current User Profile

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

#### 4. Get Mailbox Items

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

#### 5. Create Booking

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

#### 6. Get All Bookings

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

#### 7. Delete Booking

**Endpoint**: `DELETE /api/bookings/{bookingId}`

**Authentication**: Required (Bearer token)

**Response (204 No Content)** - Empty body on success

**cURL Command:**
```bash
curl -X DELETE http://localhost:8081/api/bookings/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

#### 8. Update User Profile

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

### Default Test User

For quick testing, you can use the pre-created user:

- **Email**: `tutor@be-working.com`
- **Password**: `tutor1234`

This user already has 5 mailbox items pre-loaded.

---

## 10. How the Professor Can Test the UI

### Step-by-Step Test Script

#### 1. Register a New User

1. Open **http://localhost:3000** in your browser
2. Fill in the registration form:
   - **Name**: `Test User`
   - **Email**: `test@example.com`
   - **Password**: `test1234`
3. Click **"Register"** button
4. You should be redirected to the login page

#### 2. Login

1. On the login page, enter:
   - **Email**: `test@example.com`
   - **Password**: `test1234`
2. Click **"Login"** button
3. You should be redirected to the **Dashboard**

#### 3. Explore the Dashboard

1. **Dashboard** should display:
   - User stats (name, email, subscription status)
   - Total bookings count
   - Total mailbox items count
   - Subscription status chip (should show "INACTIVE" in orange)
2. Check the **navigation sidebar** on the left:
   - Dashboard
   - Bookings
   - Mailbox
   - Profile

#### 4. Test Mailbox

1. Click **"Mailbox"** in the sidebar
2. You should see a list of mailbox items (if you used the default tutor user, you'll see 5 items)
3. Each item shows:
   - Subject
   - Message preview
   - Timestamp
   - PDF download link
4. Click on a PDF link to verify it opens/downloads

#### 5. Create a Booking

1. Click **"Bookings"** in the sidebar
2. You should see a calendar view and a form to create bookings
3. Fill in the booking form:
   - **Product**: `Meeting Room A`
   - **Date**: Select a future date (use the date picker)
   - **Start Hour**: `10:00`
   - **End Hour**: `11:30`
   - **Attendees**: `5`
4. Click **"Create Booking"** button
5. The booking should appear in the list below the form

#### 6. View Bookings List

1. Scroll down on the Bookings page
2. You should see all your bookings listed
3. Each booking shows:
   - Product name
   - Date
   - Time range
   - Number of attendees
4. Try deleting a booking by clicking the delete button (trash icon)

#### 7. Update Profile

1. Click **"Profile"** in the sidebar (or click your name/avatar in the top right)
2. A profile modal should open
3. Update fields:
   - **Name**: `Updated Name`
   - **Phone**: `+34 612 345 678`
   - **Company**: `My Company`
4. Click **"Save"** button
5. The changes should be reflected in the dashboard

#### 8. Test Responsive Design

1. Open browser **Developer Tools** (F12 or Cmd+Option+I)
2. Click the **Device Toolbar** icon (or press Cmd+Shift+M / Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. Verify:
   - Navigation sidebar collapses to a hamburger menu
   - Forms stack vertically
   - Text sizes adjust
   - Buttons remain clickable

#### 9. Test Logout

1. Click your **name/avatar** in the top right
2. Click **"Logout"** button
3. You should be redirected to the login page
4. Try accessing **http://localhost:3000/dashboard** directly - you should be redirected to login (protected route)

#### 10. Test with Default Tutor User

1. Login with:
   - **Email**: `tutor@be-working.com`
   - **Password**: `tutor1234`
2. This user already has 5 mailbox items pre-loaded
3. Verify the mailbox shows all 5 items

---

## 11. Troubleshooting

### Database Connection Errors

**Error**: `Connection to localhost:5432 refused`

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   psql -U postgres
   ```
2. Check if PostgreSQL is listening on port 5432:
   ```bash
   lsof -i :5432  # macOS/Linux
   netstat -ano | findstr :5432  # Windows
   ```
3. Verify database credentials in `application.properties` match your PostgreSQL setup
4. Try restarting PostgreSQL:
   ```bash
   brew services restart postgresql@14  # macOS
   sudo systemctl restart postgresql    # Linux
   ```

---

### CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**: 
- The backend should already have CORS configured. If you see this error:
  1. Verify backend is running on `http://localhost:8081`
  2. Verify frontend is calling `http://localhost:8081/api` (check `NEXT_PUBLIC_API_URL`)
  3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

### JWT / 401 Unauthorized Errors

**Error**: `401 Unauthorized` when accessing protected endpoints

**Solutions**:
1. **Token expired**: JWT tokens expire after 1 hour (3600000 ms). Login again to get a new token.
2. **Missing token**: Ensure you're sending the token in the `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```
3. **Invalid token**: If you modified the JWT secret in `application.properties`, all existing tokens become invalid. Login again.
4. **Token not stored**: Check browser's localStorage:
   - Open DevTools → Application → Local Storage → `http://localhost:3000`
   - Look for key `jwt` - it should contain the token

---

### Port Conflicts

**Error**: `Port 3000 is already in use` or `Port 8081 is already in use`

**Solutions**:

**For Frontend (port 3000):**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # macOS/Linux
# OR change port
npm run dev -- -p 3001
```

**For Backend (port 8081):**
1. Change `server.port=8082` in `application.properties`
2. Update `NEXT_PUBLIC_API_URL` in frontend `.env.local` to `http://localhost:8082/api`

**For PostgreSQL (port 5432):**
- Check if another PostgreSQL instance is running
- Stop conflicting services or use a different port in `application.properties`

---

### npm install Issues

**Error**: `npm ERR!` or dependency installation fails

**Solutions**:
1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
2. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Use a different Node.js version (try Node 18 LTS or 20 LTS)
4. Check internet connection (npm needs to download packages)

---

### Maven Build Issues

**Error**: `mvn clean install` fails

**Solutions**:
1. **Network issues**: Maven needs internet to download dependencies. Check your connection.
2. **Java version**: Ensure Java 17+ is installed:
   ```bash
   java -version
   ```
3. **Maven settings**: If behind a corporate proxy, configure Maven settings.xml
4. **Clean and retry**:
   ```bash
   mvn clean
   mvn install -U  # -U forces update of dependencies
   ```

---

### Backend Won't Start

**Error**: `Application failed to start` or `Bean creation failed`

**Solutions**:
1. **Check database connection**: Ensure PostgreSQL is running and credentials are correct
2. **Check logs**: Look for specific error messages in the console output
3. **Verify `application.properties`**: Ensure all required properties are set
4. **Check Java version**: Must be Java 17 or higher
5. **Port conflict**: Change `server.port` if 8081 is busy

---

### Frontend Build Errors

**Error**: TypeScript errors or build fails

**Solutions**:
1. **Type errors**: Run `npm run lint` to see specific errors
2. **Missing dependencies**: Run `npm install` again
3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

---

### PDF Files Not Loading in Mailbox

**Error**: PDF links return 404

**Solutions**:
1. Verify PDF files exist in `backend/src/main/resources/static/pdfs/`
2. Files should be named: `mail-1.pdf`, `mail-2.pdf`, etc.
3. Restart the backend after adding PDF files
4. Access PDFs via: `http://localhost:8081/pdfs/mail-1.pdf`

---

## Additional Notes

- **JWT Token Storage**: Tokens are stored in browser `localStorage` with key `jwt`
- **Session Duration**: JWT tokens expire after 1 hour. Users must login again after expiration.
- **Database Auto-Creation**: Tables are created automatically by Hibernate on first run (`ddl-auto=update`)
- **Initial Data**: The `data.sql` file loads a default tutor user and sample mailbox items on startup
- **Stripe Integration**: Subscription features are optional. The app works without Stripe configuration.
- **Theme Customization**: Material-UI theme is configured in `frontend/src/theme.ts`

---

## Support

If you encounter issues not covered in this README:

1. Check the console logs (both browser DevTools and backend terminal)
2. Verify all prerequisites are installed correctly
3. Ensure all services (PostgreSQL, backend, frontend) are running
4. Check that ports 3000, 8081, and 5432 are not blocked by firewall

---

**Happy Testing! 🚀**
