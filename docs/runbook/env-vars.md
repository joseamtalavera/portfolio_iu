# Environment Variables

## Backend
Set in `backend/.env` (loaded when running from `backend/`):
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`

Configured in `backend/src/main/resources/application.properties`:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.jpa.hibernate.ddl-auto`
- `spring.jpa.show-sql`
- `spring.jpa.properties.hibernate.format_sql`
- `spring.sql.init.mode`
- `spring.jpa.defer-datasource-initialization`
- `spring.config.import`
- `jwt.secret`
- `jwt.expiration-ms`
- `server.port`
- `stripe.secret-key`
- `stripe.webhook-secret`
- `stripe.price-id`
- `stripe.success-url`
- `stripe.cancel-url`

## Frontend
Set in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL`
