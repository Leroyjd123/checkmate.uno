# Database Setup Guide - Supabase PostgreSQL

**Time required:** 10-15 minutes  
**Cost:** FREE (Supabase free tier)

---

## Step 1: Create Supabase Project (5 minutes)

### 1a. Go to Supabase
1. Open https://supabase.com
2. Click **"Start your project"** or **Sign In** (if you have an account)
3. Create free account with GitHub or email

### 1b. Create New Project
1. Click **"New Project"**
2. Fill in:
   - **Project Name:** `checkmate-uno`
   - **Database Password:** Click **"Generate a password"** (save this somewhere safe!)
   - **Region:** Select closest to your location
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for initialization

---

## Step 2: Get Database Connection String (3 minutes)

### 2a. Open Connection Settings
1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Make sure **Connection pooling** is selected (not "Session")

### 2b. Copy Connection String
1. Click **Copy** button next to the PostgreSQL connection string
2. You'll see: `postgresql://postgres:[YOUR-PASSWORD]@[region].pooling.supabase.com:6543/postgres?sslmode=require`

### 2c. Replace Password
The password shows as `[YOUR-PASSWORD]` in the UI, but you need to:
1. Replace `[YOUR-PASSWORD]` with the actual password you generated in Step 1
2. **Example:** If password is `abc123def456`, then:
   ```
   postgresql://postgres:abc123def456@aws-0-us-east-1.pooling.supabase.com:6543/postgres?sslmode=require
   ```

---

## Step 3: Configure Backend Environment (2 minutes)

### 3a. Create `.env` file
In `backend/` directory, create a new file called `.env`:

```bash
# Database Connection (from Step 2)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?sslmode=require"

# JWT Secret (any random string, 32+ characters)
JWT_SECRET="my-super-secret-key-that-is-at-least-32-characters-long"

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3b. Example `.env`
```bash
DATABASE_URL="postgresql://postgres:abc123def456@aws-0-us-east-1.pooling.supabase.com:6543/postgres?sslmode=require"
JWT_SECRET="checkmate-uno-secret-key-12345678901234567890"
PORT=3000
NODE_ENV=development
```

✅ **Save the file as `backend/.env`**

---

## Step 4: Run Database Setup (3 minutes)

### On Windows:
```bash
cd backend
setup-db.bat
```

### On Mac/Linux:
```bash
cd backend
chmod +x setup-db.sh
./setup-db.sh
```

### Manual Setup (if scripts don't work):
```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name init

# Verify connection
npx prisma db execute --stdin < /dev/null

# Optional: View database with UI
npx prisma studio
# Opens at http://localhost:5555
```

**Expected Output:**
```
✅ Prisma client generated
✅ Migrations completed
✅ Database connection verified
```

---

## Step 5: Verify Everything Works (2 minutes)

### 5a. Check Tables Created
Option 1: Prisma Studio (easiest)
```bash
npx prisma studio
# Opens at http://localhost:5555
# Look for: users, games, game_cards, moves tables
```

Option 2: Supabase Dashboard
1. Go to Supabase dashboard
2. Click **"SQL Editor"** on left sidebar
3. Run query: `SELECT * FROM pg_tables WHERE schemaname='public';`
4. You should see 4 tables: users, games, game_cards, moves

### 5b. Test Connection
```bash
# In backend directory:
npx prisma db execute --stdin < /dev/null
```

If you see no error, connection is working! ✅

---

## Step 6: Start Backend Server (1 minute)

```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
✓ Compiled successfully
[Nest] 12345  - 05/16/2026, 3:45:00 PM  LOG [NestFactory] Nest application successfully started
Server running at http://localhost:3000
```

---

## ✅ Success Indicators

You'll know everything is working when:

- [ ] `.env` file created with DATABASE_URL and JWT_SECRET
- [ ] `npx prisma migrate dev --name init` completes without errors
- [ ] `npx prisma studio` opens and shows 4 tables
- [ ] `npm run start:dev` runs without errors
- [ ] Backend API responds at `http://localhost:3000/api/auth/login` (POST)

---

## Testing the API

### Test Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# You should get back:
# {
#   "accessToken": "eyJhbGc...",
#   "userId": "uuid-here"
# }
```

If this works, **database is fully integrated!** ✅

---

## Troubleshooting

### "Cannot connect to database"
- Verify DATABASE_URL is correct in `.env`
- Check password is properly escaped (no special characters)
- Ensure Supabase project is active (go to Supabase dashboard)
- Try: `npx prisma db execute --stdin < /dev/null`

### "Cannot find module '@prisma/client'"
- Run: `npx prisma generate`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### "PostgreSQL error: invalid password"
- Your password has special characters that need escaping
- Get a new password from Supabase (Settings → Database → Generate password)
- Or URL-encode special chars (% → %25, @ → %40, etc.)

### "Migration failed: relation already exists"
- You ran migrations twice
- This is ok, migrations are idempotent
- Just run again: `npx prisma migrate dev`

### "Prisma studio won't open"
- Make sure you're in the `backend/` directory
- Run: `npx prisma studio`
- It will open at `http://localhost:5555`

---

## What Gets Created

### Tables
1. **users** - User accounts
2. **games** - Game records
3. **game_cards** - Power cards in games
4. **moves** - Move history (analytics)

### Fields (example)
```sql
-- users
id (UUID), email (UNIQUE), themePreference, createdAt, updatedAt

-- games
id, mode, roomCode (UNIQUE), status, boardState (FEN), currentTurn, 
activeEffects (JSONB), hostId, guestId, winnerId, createdAt, updatedAt

-- game_cards
id, gameId, playerId, cardType, status, usedAt

-- moves
id, gameId, playerId, moveNotation, cardUsed, timestamp
```

---

## Next Steps

1. ✅ Database running
2. ⏳ Run: `npm run start:dev` (backend API)
3. ⏳ Run: `npm run dev` (frontend) in `frontend/` directory
4. ⏳ Test integration (see [`INTEGRATION_CHECKLIST.md`](./INTEGRATION_CHECKLIST.md))

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| DATABASE_URL | Yes | `postgresql://...` | From Supabase connection pooling |
| JWT_SECRET | Yes | `my-secret-key-32+chars` | For signing JWT tokens |
| PORT | No | 3000 | Default is 3000 |
| NODE_ENV | No | development | Use "production" for deploy |

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Connection Pooling:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling

**Database setup complete? Follow [`INTEGRATION_CHECKLIST.md`](./INTEGRATION_CHECKLIST.md) Phase 2 to test!** 🚀
