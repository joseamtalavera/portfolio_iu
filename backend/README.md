# BeWorking Backend (Spring Boot 3, Java 17)

## Requirements

- Java 17+
- Maven 3.9+
- PostgreSQL 14+ running locally

## Database Setup

1. Start Postgres (e.g., `brew services start postgresql@14` on macOS).

2. Create DB/user (adjust as needed):

```bash
psql -U postgres postgres
```

```sql
-- inside psql:
CREATE USER bework_user WITH PASSWORD 'bework_pass';
CREATE DATABASE database_iu OWNER bework_user;
GRANT ALL PRIVILEGES ON DATABASE database_iu TO bework_user;
\q
```

3. Confirm login:

```bash
psql -h localhost -U bework_user -d database_iu -c '\conninfo'
```

## Configuration (`src/main/resources/application.properties`)

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/database_iu
spring.datasource.username=bework_user
spring.datasource.password=bework_pass
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Replace with a strong base64-encoded 256-bit key, e.g. `openssl rand -base64 64`
jwt.secret=changeme_base64_256bit_key
jwt.expiration-ms=3600000

server.port=8081
```

## Build & Run

```bash
mvn -DskipTests compile
mvn spring-boot:run
```

API base: `http://localhost:8081`

## API Contract

**Base URL:** `http://localhost:8081/api`

### Authentication Endpoints (Public)

- **POST** `/api/auth/register` 
  - Body: `{name,email,password}` 
  - Response: `201 {message,userId}`

- **POST** `/api/auth/login` 
  - Body: `{email,password}` 
  - Response: `200 {token,user:{id,name,email}}`

### Protected Endpoints (Require `Authorization: Bearer <token>` header)

- **GET** `/api/user/me` 
  - Response: `200 {id,name,email}`

- **GET** `/api/mailbox` 
  - Response: `200 [{id,subject,message,timestamp}, ...]`

- **POST** `/api/bookings` 
  - Body: `{product,date,startHour,endHour,attendees}` 
  - Response: `201 {id,message:"Booking created successfully"}`

- **GET** `/api/bookings` 
  - Response: `200 [{id,product,date,startHour,endHour,attendees}, ...]`

## Notes

- Uses JWT (HS256) for authentication; password hashing with BCrypt.
- JPA/Hibernate auto-creates tables (`ddl-auto=update`)—for production, use migrations.
- All API endpoints are prefixed with `/api`.
- If port 8081 is busy, change `server.port` to a free port.

