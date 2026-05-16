# Phase 3 Quick Start - Database Setup & Integration Testing

**Time:** 30-45 minutes  
**Goal:** Database running + Both servers up + Integration verified

---

## 🚀 TL;DR (10 minutes)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Copy connection string from Settings → Database → Connection Pooling
# 3. Create backend/.env:
echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?sslmode=require"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
PORT=3000
NODE_ENV=development' > backend/.env

# 4. Run setup script (Windows):
cd backend
setup-db.bat

# 4. Run setup script (Mac/Linux):
cd backend
chmod +x setup-db.sh
./setup-db.sh

# 5. Start servers:
# Terminal 1:
cd backend && npm run start:dev

# Terminal 2:
cd frontend && npm run dev
```

Done! ✅ Backend at `http://localhost:3000`, Frontend at `http://localhost:3001`

---

## 📋 Detailed Steps (45 minutes)

### Phase 3.0: Get Supabase Credentials (10 minutes)

**See full guide:** [`DATABASE_SETUP.md`](./DATABASE_SETUP.md)

**Quick steps:**
1. Go to https://supabase.com → Sign up/in
2. Click **"New Project"**
3. Name: `checkmate-uno`
4. Set password (save it!)
5. Click create, wait 2-3 minutes
6. Go to **Settings** → **Database**
7. Copy **Connection Pooling** PostgreSQL URL
8. Replace `[YOUR-PASSWORD]` with your actual password

**Result:** Connection string like:
```
postgresql://postgres:abc123def456@aws-0-us-east-1.pooling.supabase.com:6543/postgres?sslmode=require
```

---

### Phase 3.1: Create Backend Environment File (2 minutes)

Create `backend/.env`:

```bash
# From Step 1 above:
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?sslmode=require"

# Generate random secret (32+ chars):
JWT_SECRET="my-super-secret-key-that-is-at-least-32-characters-long"

# Server config:
PORT=3000
NODE_ENV=development
```

✅ Save file as `backend/.env`

---

### Phase 3.2: Run Database Setup (5 minutes)

**On Windows:**
```bash
cd backend
setup-db.bat
```

**On Mac/Linux:**
```bash
cd backend
chmod +x setup-db.sh
./setup-db.sh
```

**Expected output:**
```
✅ Dependencies installed
✅ Prisma client generated
✅ Migrations completed
✅ Database connection verified
```

**What this does:**
1. Installs npm packages
2. Generates Prisma client
3. Creates all database tables
4. Verifies connection works
5. Optional: Opens Prisma Studio (UI for database)

✅ **If no errors, database is ready!**

---

### Phase 3.3: Seed Test Data (Optional, 1 minute)

Add test users + games to play with:

```bash
cd backend
npm run db:seed
```

**Creates:**
- 3 test users: alice@example.com, bob@example.com, charlie@example.com
- 3 test games (local, online waiting, completed)
- Test moves and cards

✅ **Now you have test data without manually creating it**

---

### Phase 3.4: Start Backend Server (1 minute)

```bash
cd backend
npm run start:dev
```

**Expected output:**
```
[Nest] 12345  - 05/16/2026, 3:45:00 PM  LOG [NestFactory] Nest application successfully started
```

✅ **Backend running at `http://localhost:3000/api`**

---

### Phase 3.5: Start Frontend Server (In new terminal, 1 minute)

```bash
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3001
✓ Ready in 1234ms
```

✅ **Frontend running at `http://localhost:3001`**

---

### Phase 3.6: Test Integration (15 minutes)

**See full checklist:** [`INTEGRATION_CHECKLIST.md`](./INTEGRATION_CHECKLIST.md)

**Quick tests:**

#### Test 1: Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Expected: { "accessToken": "...", "userId": "..." }
```

#### Test 2: Create Local Game
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{ "mode": "local" }'

# Expected: { "id": "...", "mode": "local", "boardState": "..." }
```

#### Test 3: Frontend Test
1. Open http://localhost:3001
2. Click **Register**
3. Enter email & password
4. Click lobby button
5. Create local game
6. Should see chess board

✅ **If all these work, integration is complete!**

---

## ✅ Success Checklist

Mark each as complete:

- [ ] Supabase project created
- [ ] DATABASE_URL copied to backend/.env
- [ ] JWT_SECRET added to backend/.env
- [ ] `setup-db.bat` or `setup-db.sh` ran successfully
- [ ] No database errors
- [ ] Backend server started (`npm run start:dev`)
- [ ] Frontend server started (`npm run dev`)
- [ ] Can register new user (API test or UI)
- [ ] Can create local game (API test or UI)
- [ ] Frontend shows chess board
- [ ] No console errors in browser

**All checked?** → **Phase 3 Complete! ✅**

---

## 🆘 Troubleshooting

### "Cannot connect to database"
→ See [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) "Troubleshooting" section

### "npm ERR! Cannot find module"
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 is already in use"
```bash
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### "Frontend won't connect to API"
- Check backend is running: http://localhost:3000/api (should 404, not connection error)
- Check CORS is enabled in backend (it is by default)
- Check frontend is calling correct API_BASE in lib/api.ts

### "Prisma migration failed"
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run seed to get test data back
npm run db:seed
```

---

## 📊 Architecture at This Point

```
Your Computer
├── Backend (NestJS)
│   ├── Runs on localhost:3000
│   ├── Connected to Supabase PostgreSQL
│   ├── Has 4 tables: users, games, game_cards, moves
│   └── Handles all auth + game logic
│
└── Frontend (Next.js)
    ├── Runs on localhost:3001
    ├── Calls backend API at localhost:3000/api
    ├── Shows login/register pages
    ├── Shows chess board
    └── Ready for game UI implementation

Database (Supabase)
└── PostgreSQL in the cloud
    ├── Stores all game data
    ├── Stores user accounts
    └── Available 24/7
```

---

## 🎮 What's Next (Phase 4)

Once everything is running:

1. **Build GameBoard component** (4-6 hours)
   - Render chess board from FEN
   - Show legal move highlights
   - Click-to-move input

2. **Connect move execution** (2-3 hours)
   - Frontend calls API on move
   - Board updates
   - Show errors

3. **Build PowerCard UI** (2-3 hours)
   - Show 3-card hand
   - Play card button
   - Call API on card use

4. **Real-time WebSocket sync** (1-2 hours)
   - Listen for opponent moves
   - Auto-update board
   - Show game over

**Result:** Fully playable chess game! 🎉

---

## 📚 Reference

- **Full Database Guide:** [`DATABASE_SETUP.md`](./DATABASE_SETUP.md)
- **Integration Testing:** [`INTEGRATION_CHECKLIST.md`](./INTEGRATION_CHECKLIST.md)
- **API Quick Start:** [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md)
- **Backend Status:** [`BACKEND_STATUS.md`](./BACKEND_STATUS.md)

---

## ⏱️ Time Breakdown

| Step | Time | Notes |
|------|------|-------|
| Supabase setup | 10 min | One-time manual |
| Backend .env | 2 min | Copy-paste |
| Database setup | 5 min | Automated script |
| Backend server | 1 min | `npm run start:dev` |
| Frontend server | 1 min | `npm run dev` |
| Integration tests | 15 min | Follow checklist |
| **Total** | **~35 min** | Less if you skim |

---

## 🚀 Ready?

1. Create Supabase project (takes 2-3 min to initialize)
2. Run setup script
3. Start both servers
4. Test integration

**Go!** 🎮

See [`DATABASE_SETUP.md`](./DATABASE_SETUP.md) Step 1 to begin.
