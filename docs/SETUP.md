# Setup & Run Guide

## Prerequisites

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

## Environment Variables

### Frontend Environment Variables

The frontend uses environment variables prefixed with `NEXT_PUBLIC_` (these are exposed to the browser).

**Option 1: Create `.env.local` file** (recommended for local development)

Create a file at `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081/api
```

**Option 2: Use default values**

If you don't create `.env.local`, the frontend will use default values defined in `frontend/src/config/constants.ts`:
- `API_URL` defaults to `http://localhost:8081/api`
- `STRIPE_PUBLIC_KEY` defaults to a placeholder (Stripe is optional)

**Note**: The `.env.local` file should **NOT** be committed to Git (it's in `.gitignore`).

### Backend Configuration

The backend uses `application.properties` (not `.env`).

**File location**: `backend/src/main/resources/application.properties`

The backend also loads `backend/.env` automatically when you run Spring Boot from the `backend` folder.

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
stripe.secret-key=${STRIPE_SECRET_KEY:}
stripe.webhook-secret=${STRIPE_WEBHOOK_SECRET:}
stripe.price-id=${STRIPE_PRICE_ID:}
stripe.success-url=http://localhost:3000/subscription/success
stripe.cancel-url=http://localhost:3000/subscription/cancel
```

**Important**:
- Update the database credentials (`username`, `password`, `database name`) to match your PostgreSQL setup (see Database Setup section below).
- The JWT secret is already provided (for demo purposes). In production, generate a new secret.
- Stripe configuration is optional. For Stripe, set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_ID` as environment variables before running the backend.

---

## Database Setup (PostgreSQL)

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

Optional quick check:
```bash
psql -h localhost -U bework_user -d database_iu -c '\conninfo'
```

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

## Run Backend (Spring Boot)

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
  '  |____| .__|_| |_|_| |_|\__, | / / / /
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

If you get a response (even an error about email already existing), the backend is running.

**API Base URL**: `http://localhost:8081/api`

**Stop the backend**: Press `Ctrl+C` in the terminal where it's running.

---

## Run Frontend (Next.js)

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

## Run Both Together

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

## (Optional) Project Bootstrap (Spring Initializr)

If you want to recreate the original backend scaffold, it was generated with **Spring Initializr** (VS Code command or start.spring.io) using:
- Project: Maven
- Language: Java
- Spring Boot: 3.2.x or 3.3.x
- Group: com.beworking
- Artifact/Name: backend
- Package: com.beworking.backend
- Packaging: Jar
- Java: 17
- Dependencies: Spring Web, Spring Security, Spring Data JPA, Validation, PostgreSQL Driver, Lombok (optional)
