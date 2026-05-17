# Integration Checklist - Phase 4 API Integration (May 17, 2026)

**Current Status - All Prerequisites Met ✅**
- ✅ Backend: PostgreSQL working, all 33 tests passing, code merged to master
- ✅ Frontend: Next.js + React 18, local gameplay fully functional, 33 tests passing
- ✅ Database: Supabase PostgreSQL connected, all tables operational, migrations complete
- 🚀 Integration: Phase 4 ACTIVE - Sam (Frontend) executing Tasks 2.1-2.6 (6-7 hours)

---

## Phase 4 Tasks (Currently Executing)

### Task 2.1: API Client Verification (45 min) — IN PROGRESS
- [ ] Verify endpoint URLs at localhost:3000/api
- [ ] Test connectivity to real backend
- [ ] Confirm REST client configuration
- **Status:** Ready to start

### Task 2.2: GameContext → Real API (1.5 hrs) — QUEUED
- [ ] Replace mock API calls with real endpoints
- [ ] Test: createGame, joinGame, makeMove, useCard
- [ ] Add loading states and error handling
- **Status:** Blocked on Task 2.1

### Task 2.3: WebSocket Real-Time Sync (1.5 hrs) — QUEUED
- [ ] Connect to WebSocket at localhost:3000
- [ ] Listen for opponent moves
- [ ] Implement reconnection logic
- **Status:** Blocked on Task 2.2

### Task 2.4-2.6: E2E Testing & Code Review (2-3 hrs) — QUEUED
- [ ] Run 23-scenario E2E test plan
- [ ] Test multiplayer with 2 browsers
- [ ] Code review against checkmate-uno-ai-rules.md
- [ ] Verify zero any types, zero TypeScript errors
- **Status:** Blocked on Tasks 2.1-2.3

---

## Phase 1: Database Setup (CRITICAL - Complete ✅)

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose project name: `checkmate-uno`
4. Generate strong database password (save it!)
5. Select region closest to your users
6. Wait for initialization (~2 min)

### Step 2: Get Database Connection String
1. In Supabase dashboard → **Settings** → **Database**
2. Find **Connection String** section
3. Copy the **Connection pooling** PostgreSQL URL
4. Replace `[YOUR-PASSWORD]` with your password
5. Ensure URL ends with `?sslmode=require`

**Format:**
```
postgresql://postgres:[password]@[host]:6543/postgres?sslmode=require
```

### Step 3: Configure Backend Environment

Create `.env` in `backend/` directory:

```bash
# Database (from Supabase Step 2)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:6543/postgres?sslmode=require"

# JWT Secret (any random 32+ character string)
JWT_SECRET="your-super-secret-key-at-least-32-characters-long-here"

# Server
PORT=3000
NODE_ENV=development
```

### Step 4: Database Already Set Up ✅

All tables created via migrations:
- users table
- games table
- game_cards table
- moves table

**Note:** We use raw PostgreSQL queries (pg client) instead of Prisma for Windows compatibility.

### Step 5: Verify Database Connection ✅

```bash
cd backend
npm run start:dev

# Expected output:
# ✓ Database connected
```

✅ **Database is connected and ready!**

---

## Phase 2: Run Both Servers

### Terminal 1: Backend API

```bash
cd backend
npm run start:dev

# Output should show:
# ✓ Compiled successfully
# [Nest] 12345  - 05/16/2026, 3:45:00 PM     LOG [NestFactory] Nest application successfully started +2ms
# [Nest] 12345  - 05/16/2026, 3:45:00 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +1234ms
```

### Terminal 2: Frontend Dev Server

```bash
cd frontend
npm run dev

# Output should show:
# ▲ Next.js 16.2.6
# - Local:         http://localhost:3001
# - Network:       http://192.168.x.x:3001
# ✓ Ready in 1234ms
```

**Verify Both Running:**
- Backend API: http://localhost:3000/api/auth/login (POST)
- Frontend App: http://localhost:3001
- WebSocket: ws://localhost:3000

---

## Phase 3: Test Authentication Flow

### Test 1: Register New User

**Via Frontend:**
1. Open http://localhost:3001
2. Click **Register**
3. Enter:
   - Email: `test@example.com`
   - Password: `TestPass123` (must have uppercase, lowercase, number)
4. Click **Register**
5. Should redirect to Lobby

**Via API (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "userId": "uuid-here"
}
```

### Test 2: Login

**Via Frontend:**
1. Open http://localhost:3001/auth/login
2. Enter credentials from Test 1
3. Click **Login**
4. Should redirect to Lobby

**Via API:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

---

## Phase 4: Test Game Creation

### Test 1: Create Local Game

**Via Frontend:**
1. On Lobby page, click **Play Local**
2. Should load game board
3. Make a move (click two squares)
4. Board should update

**Via API:**
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "local"
  }'

# Response:
{
  "id": "game-uuid",
  "mode": "local",
  "boardState": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "currentTurn": "white",
  "yourCards": ["skip_turn", "shield", "teleport"],
  "status": "in_progress"
}
```

### Test 2: Create Online Game (With Token)

**Get Token First:**
```bash
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}' \
  | jq -r '.accessToken')

echo $TOKEN
```

**Create Online Game:**
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "online"
  }'

# Response includes roomCode for opponent to join
{
  "id": "game-uuid",
  "mode": "online",
  "roomCode": "ABC123",
  "status": "waiting",
  "yourCards": ["reverse_move", "freeze", "teleport"]
}
```

### Test 3: Join Online Game

**Second User Registers & Joins:**
```bash
# Register second user
TOKEN2=$(curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"TestPass123"}' \
  | jq -r '.accessToken')

# Join with room code from Test 2
curl -X POST http://localhost:3000/api/games/join \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "room_code": "ABC123"
  }'

# Game status changes from "waiting" to "in_progress"
```

---

## Phase 5: Test Moves & Cards

### Make a Move

```bash
curl -X POST http://localhost:3000/api/games/{gameId}/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "e2",
    "to": "e4"
  }'

# Response:
{
  "success": true,
  "boardState": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "currentTurn": "black",
  "isCheck": false,
  "isCheckmate": false
}
```

### Use a Card

```bash
curl -X POST http://localhost:3000/api/games/{gameId}/use-card \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "card_id": "{cardId}"
  }'

# Response:
{
  "success": true,
  "cardUsed": "skip_turn",
  "activeEffects": [
    {
      "type": "skip_turn",
      "pieceSquare": null,
      "turnsRemaining": 1,
      "appliedBy": "{userId}"
    }
  ]
}
```

---

## Phase 6: Test WebSocket Real-time Sync

### Connect Socket.io Client

```bash
# Use socket.io-cli or Node.js REPL
npm install -g socket.io-cli

# Or use Node.js:
node << 'EOF'
const io = require('socket.io-client');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket');
  
  // Subscribe to game
  socket.emit('subscribe_game', {
    gameId: 'your-game-id',
    userId: 'your-user-id'
  });
  
  // Listen for opponent moves
  socket.on('move_made', (data) => {
    console.log('Opponent moved:', data.from, 'to', data.to);
  });
});
EOF
```

### Broadcasting Moves

**In one client/user:**
```javascript
socket.emit('move_made', {
  gameId: 'game-id',
  userId: 'user-1',
  from: 'e2',
  to: 'e4',
  boardState: '...',
  currentTurn: 'black'
});
```

**Other client receives:**
```javascript
socket.on('move_made', (data) => {
  console.log(`User moved: ${data.from} -> ${data.to}`);
  // Update board UI
});
```

---

## Integration Verification Checklist

### Backend ✅
- [ ] npm install succeeds
- [ ] npm run build succeeds
- [ ] Database connected (Prisma Studio opens)
- [ ] npm run start:dev runs without errors
- [ ] All 27 ChessService tests pass (`npm test`)

### Frontend ✅
- [ ] npm install succeeds
- [ ] npm run build succeeds
- [ ] npm run dev runs on http://localhost:3001
- [ ] Pages load (home, auth, lobby, game)
- [ ] No TypeScript errors

### API Integration ✅
- [ ] Login/Register works
- [ ] Tokens stored in localStorage
- [ ] API calls include Authorization header
- [ ] Error responses handled gracefully
- [ ] Timeouts work (5 second default)

### Game Logic ✅
- [ ] Local game creates successfully
- [ ] Moves validated server-side
- [ ] Checkmate detection works
- [ ] Online game room codes work
- [ ] Two players can join same game

### Real-time Sync ✅
- [ ] WebSocket connects on game start
- [ ] Move_made events broadcast
- [ ] Card_used events broadcast
- [ ] Game_over events trigger game end
- [ ] Opponent moves appear without refresh

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL in .env is correct
- Verify Supabase project is active
- Check password doesn't contain special chars needing escaping
- Run `npx prisma db execute --stdin < /dev/null` to test

### "401 Unauthorized"
- Token might be expired or malformed
- Check Authorization header format: `Bearer {token}`
- Try re-login to get fresh token

### "Move rejected as illegal"
- Verify from/to squares are valid (e2, e4, etc.)
- Check it's your turn (currentTurn matches your color)
- Ensure piece exists at "from" square

### "WebSocket not connecting"
- Ensure backend is running on port 3000
- Check browser console for connection errors
- Verify Socket.io URL is `http://localhost:3000` (not /api)
- Look at backend logs for WebSocket errors

### "Build fails: Module not found"
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf .next dist`
- Check tsconfig paths are correct

---

## Performance Optimization Notes

1. **Polling Interval:** GET /api/games/:id every 1-2 seconds works well for MVP
2. **Move Debouncing:** Add 100-200ms debounce to prevent move spam
3. **Card Effects:** Only re-render affected pieces on board
4. **FEN Updates:** Only update board when FEN actually changes
5. **Event Cleanup:** Remove all WebSocket listeners in useEffect cleanup

---

## Next Phase Tasks

After verifying this checklist ✅:

1. **Build Board UI** - Render chess board from FEN
2. **Implement Move Input** - Click squares or drag pieces
3. **Card Visualization** - Show 3 cards in hand with play button
4. **Active Effects** - Highlight pieces under effects
5. **Game Over Screen** - Show winner and stats
6. **Mobile Responsiveness** - Test on phone/tablet
7. **Polish & UX** - Error handling, loading states, animations

---

## Support Resources

- **API Docs:** [`BACKEND_API_REFERENCE.md`](./BACKEND_API_REFERENCE.md)
- **Quick Start:** [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md)
- **WebSocket Guide:** [`WEBSOCKET_GUIDE.md`](./WEBSOCKET_GUIDE.md)
- **Frontend Dev:** [`FRONTEND_DEVELOPMENT.md`](./FRONTEND_DEVELOPMENT.md)
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs

---

## Success Criteria

✅ **Integration is successful when:**

1. Users can register and login
2. Users can create local games and make moves
3. Users can create online games and join via room code
4. Users see opponent moves in real-time (with WebSocket)
5. Users can use power cards and see effects
6. Games end correctly on checkmate
7. No console errors in browser or backend

**Estimated time to completion:** 4-6 hours with both agents working in parallel.
