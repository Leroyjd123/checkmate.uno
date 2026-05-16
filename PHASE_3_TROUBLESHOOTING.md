# Phase 3 Troubleshooting Guide

**Status:** In Progress - Database setup encountered issues

---

## Current Issue: Connection String Validation

**Problem:** Database connection failed with `ENOTFOUND db.lodmsimbyzfgocjvegrh.supabase.co`

**What this means:**
- The hostname cannot be resolved by your system
- Either the connection string is incorrect, or Supabase project hasn't fully initialized

### Fix: Verify Your Connection String

1. **Go to Supabase Dashboard:** https://supabase.com
2. **Navigate to:** Settings → Database
3. **Look for:** "Connection String" or "Connection Pooling"
4. **Select:** PostgreSQL (not URI)
5. **Copy the FULL URL** — it should look exactly like:
   ```
   postgresql://postgres:PASSWORD@HOST:PORT/postgres
   ```

**Key points:**
- The HOST should be something like: `db.XXXX.supabase.co` or `aws-0-us-east-1.pooling.supabase.com`
- PORT is usually `5432` (direct) or `6543` (pooling)
- Replace `PASSWORD` with your actual database password

---

## Known Issues & Workarounds

### Issue 1: Prisma 7 Config Format

**Problem:** `prisma.config.js` file syntax errors prevent migrations from running

**Root Cause:** Prisma 7 changed how datasource URLs are configured. The old `url = env("DATABASE_URL")` syntax in schema.prisma no longer works.

**Workaround Options:**

**Option A: Downgrade to Prisma 6** (Recommended if possible)
```bash
cd backend
npm install --save-exact @prisma/client@6 prisma@6
npx prisma db push
```

**Option B: Use Supabase SQL Editor** (No Prisma required)
1. Go to Supabase dashboard
2. Click "SQL Editor" (left sidebar)
3. Create a new query
4. Copy the SQL from `backend/prisma/migrations/init/migration.sql`
5. Paste and run in the SQL editor

**Option C: Prisma 7 Config File**
- Create `prisma.config.js` in backend root with proper syntax
- Current attempts failing; may require specific module format

---

## Database Setup Checklist

- [ ] Supabase project created
- [ ] Connection string verified (no ENOTFOUND error)
- [ ] `.env` file has correct DATABASE_URL
- [ ] Database tables created (via migrations or manual SQL)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Backend server starts without database errors
- [ ] Test user creation works

---

## Connection String Format Examples

### Direct Connection (port 5432)
```
postgresql://postgres:MyPassword123@db.abc123def456.supabase.co:5432/postgres
```

### Connection Pooling (port 6543)
```
postgresql://postgres:MyPassword123@db.abc123def456.pooling.supabase.co:6543/postgres?sslmode=require
```

**Note:** Either format works, but pooling is better for production. For MVP testing, either is fine.

---

## Next Steps

1. **Verify your connection string** (copy directly from Supabase dashboard)
2. **Paste the verified string** so we can test the connection
3. **Choose a workaround** for the Prisma 7 config issue (Option A, B, or C)
4. **Run migrations** once config is resolved
5. **Seed test data** with `npm run db:seed`
6. **Start servers** and test integration

---

## Files Modified in Phase 3

- `backend/.env` — Database URL and JWT secret
- `backend/prisma/schema.prisma` — Removed `url` property (Prisma 7 requirement)
- `backend/src/database/prisma.service.ts` — Updated constructor for Prisma 7
- `backend/setup-db.bat` — Automated setup script (Windows)
- `backend/setup-db.sh` — Automated setup script (Mac/Linux)
- `backend/prisma/seed.ts` — Test data seeding
- `backend/prisma.config.js` — Config file (syntax issue needs resolution)

---

## Testing Commands

Once database is connected, test with:

```bash
# Test Prisma client generation
npx prisma generate

# View database with UI
npx prisma studio

# Seed test data
npm run db:seed

# Start backend server
npm run start:dev
```

---

## Questions or Issues?

1. **Connection timeout?** → Check internet connection, firewall blocking Supabase
2. **Authentication failed?** → Password might need URL encoding (%, @, etc.)
3. **"relation already exists"?** → Tables already created, migrations are idempotent
4. **Prisma command not found?** → Run `npm install` in backend directory first

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete setup documentation.
