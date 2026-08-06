# Troubleshooting

## Database Connection Errors

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
3. Verify database credentials in `backend/.env` (`DB_USERNAME`, `DB_PASSWORD`) match your PostgreSQL setup
4. Try restarting PostgreSQL:
   ```bash
   brew services restart postgresql@14  # macOS
   sudo systemctl restart postgresql    # Linux
   ```

---

## CORS Issues

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
- The backend should already have CORS configured. If you see this error:
  1. Verify backend is running on `http://localhost:8081`
  2. Verify frontend is calling `http://localhost:8081/api` (check `NEXT_PUBLIC_API_URL`)
  3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

---

## JWT / 401 Unauthorized Errors

**Error**: `401 Unauthorized` when accessing protected endpoints

**Solutions**:
1. **Token expired**: JWT tokens expire after 1 hour (3600000 ms). Login again to get a new token.
2. **Missing token**: Ensure you're sending the token in the `Authorization` header:
   ```
   Authorization: Bearer <token>
   ```
3. **Invalid token**: If you changed `JWT_SECRET` in `backend/.env`, all existing tokens become invalid. Login again.
4. **Token not stored**: Check browser's localStorage:
   - Open DevTools → Application → Local Storage → `http://localhost:3000`
   - Look for key `jwt` - it should contain the token

---

## Port Conflicts

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

## npm install Issues

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

## Maven Build Issues

**Error**: `./mvnw clean install` fails

**Solutions**:
1. **Network issues**: Maven needs internet to download dependencies. Check your connection.
2. **Java version**: Ensure Java 17+ is installed:
   ```bash
   java -version
   ```
3. **Maven settings**: If behind a corporate proxy, configure Maven settings.xml
4. **Clean and retry**:
   ```bash
   ./mvnw clean
   ./mvnw install -U  # -U forces update of dependencies
   ```

---

## Backend Won't Start

**Error**: `Application failed to start` or `Bean creation failed`

**Solutions**:
1. **Check database connection**: Ensure PostgreSQL is running and credentials are correct
2. **Check logs**: Look for specific error messages in the console output
3. **Verify `application.properties`**: Ensure all required properties are set
4. **Check Java version**: Must be Java 17 or higher
5. **Port conflict**: Change `server.port` if 8081 is busy

---

## Frontend Build Errors

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

## PDF Files Not Loading in Mailbox

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

## Stripe: Subscription Stays INACTIVE After Paying

**Note:** Stripe is optional and only needed for a *brand-new* self-registered user who wants
to subscribe. The seeded `tutor@be-working.com` account is already active, so reviewing the app
(authentication + booking) needs none of this.

**Cause**: Supplying the `STRIPE_*` keys is not enough on its own. Stripe confirms a payment by
calling your backend on a **webhook**, and that is what flips a user's `subscriptionStatus` to
`ACTIVE`. Locally, Stripe cannot reach `localhost` unless you forward its events — so without
the steps below, checkout succeeds but the account never activates (bookings stay behind the
paywall).

**Setup (Stripe test mode)** — three processes must run: the backend, the frontend, and `stripe listen`.

1. **Install the Stripe CLI** and log in:
   ```bash
   stripe login
   ```
2. **Forward webhook events** to the backend — keep this running in its own terminal:
   ```bash
   stripe listen --forward-to localhost:8081/api/subscription/webhook
   ```
   On start it prints a signing secret, `whsec_…`.
3. **Match the secret.** Copy that `whsec_…` into `STRIPE_WEBHOOK_SECRET` in `backend/.env`,
   then **restart the backend** — the value is read at startup. If it doesn't match, the webhook
   is rejected with `400` and nothing activates.
4. **Pay in test mode.** Subscribe from the app and use card `4242 4242 4242 4242`, any future
   expiry, any CVC. The `stripe listen` terminal should show `checkout.session.completed → 200`,
   and the account becomes `ACTIVE`.

---

## Support

If you encounter issues not covered in this doc:

1. Check the console logs (both browser DevTools and backend terminal)
2. Verify all prerequisites are installed correctly
3. Ensure all services (PostgreSQL, backend, frontend) are running
4. Check that ports 3000, 8081, and 5432 are not blocked by firewall
