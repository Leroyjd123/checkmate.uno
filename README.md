# Checkmate.Uno - Chess Variant Game

A real-time multiplayer chess game with power cards, built with NestJS + React/Next.js.

**Current Status:** ✅ Phase 3 (PostgreSQL Backend & Local Gameplay) Complete | 🚀 Phase 4 (Frontend Integration) Active (May 17, 2026)

> [!SUCCESS]
> **All Blockers Resolved:** PostgreSQL fully operational (replaced Prisma Windows issue), all 33 backend tests passing, frontend fully playable locally, code merged to master. Phase 4 integration starting now.

---

## Project Overview

**Checkmate.Uno** is a chess game with 8 one-time-use power cards that modify gameplay:
- Skip Turn, Reverse Move, Extra Move
- Teleport, Shield, Sacrifice, Wild Swap, Freeze

**Tech Stack:**
- **Backend:** NestJS 11 + PostgreSQL (pg client) + Supabase + Socket.io + chess.js
- **Frontend:** Next.js 16 + React 18.3.1 + Tailwind CSS + TypeScript
- **Real-time:** WebSocket (Socket.io) + REST API
- **Database:** PostgreSQL with parameterized SQL (zero injection risk)

**Game Modes:**
- 👤 **Local** - Client-side only (no auth)
- 🤖 **Computer** - vs. random AI opponent
- 🌐 **Online** - Real-time multiplayer (room codes)

---

## Documentation

### For Backend Developers
- [`BACKEND_STATUS.md`](./BACKEND_STATUS.md) - Week 1 progress, architecture, what's complete
- [`BACKEND_API_REFERENCE.md`](./BACKEND_API_REFERENCE.md) - Full API spec (all endpoints)
- [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md) - Quick reference for API usage

### For Frontend Developers
- [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md) - ⭐ Start here! (API client setup, auth flow)
- [`BACKEND_API_REFERENCE.md`](./BACKEND_API_REFERENCE.md) - Full endpoint reference & error handling
- [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md) - Database setup (for backend dev)

### For Game Design
- `checkmate-uno-frd.md` - Full game rules & card effects (in docs folder)
- `checkmate-uno-trd-backend.md` - Technical architecture decisions
- `checkmate-uno-ai-rules.md` - Implementation rules & patterns

---

## Quick Start

### Backend (NestJS + PostgreSQL)

```bash
cd backend

# Set up environment
cp .env.example .env
# Edit .env with:
# - DATABASE_URL (from Supabase, e.g., postgres://user:pass@host/db)
# - JWT_SECRET (any random string, 32+ chars)

# Install dependencies
npm install

# Start development server (PostgreSQL connection auto-verified)
npm run start:dev
# Expected output: "✓ Database connected"
# Server runs at http://localhost:3000/api
```

### Run Tests
```bash
npm test                    # All 33 tests (33 passing ✅)
npm test -- games.service   # Game logic tests
```

### Verify Backend
```bash
# Full verification
npm run build              # Build succeeds ✅
npm run start:dev          # Starts with "✓ Database connected" ✅
npm test                   # All 33 tests pass ✅
npm run lint               # Zero lint errors ✅

# API is ready at http://localhost:3000/api
```

---

## API Overview

**Base URL:** `http://localhost:3000/api`

### Authentication
```
POST /api/auth/register   { email, password }
POST /api/auth/login      { email, password }
```

### Games
```
POST   /api/games                Create game
GET    /api/games/:id            Get game state
POST   /api/games/join           Join by room code
POST   /api/games/:id/move       Execute move
POST   /api/games/:id/use-card   Use power card
```

See [`BACKEND_API_REFERENCE.md`](./BACKEND_API_REFERENCE.md) for full specs with examples.

---

## Database Schema

```
User
  ├─ id (UUID)
  ├─ email (unique)
  └─ Relations: hostedGames, guestGames, wonGames, gameCards, moves

Game
  ├─ id, mode (local|computer|online), roomCode
  ├─ status (waiting|in_progress|completed|forfeited)
  ├─ boardState (FEN notation)
  ├─ currentTurn (white|black)
  ├─ activeEffects (JSONB array)
  └─ Relations: host, guest, winner, cards, moves

GameCard
  ├─ id, gameId, playerId
  ├─ cardType (skip_turn|reverse_move|...|freeze)
  ├─ status (available|used)
  └─ usedAt (timestamp)

Move (analytics only)
  ├─ id, gameId, playerId
  ├─ moveNotation (e.g., "e2e4")
  └─ cardUsed (e.g., "shield")
```

---

## Frontend Integration Checklist

### Phase 1: Auth & Game Setup
- [ ] Set up API client (axios/fetch with auto-token injection)
- [ ] Create login/register pages
- [ ] Store JWT token (localStorage/sessionStorage)
- [ ] Create game mode selection screen
- [ ] Implement room code sharing (online mode)

### Phase 2: Game Board & Moves
- [ ] Build chess board UI from FEN notation
- [ ] Implement move input (drag-drop or click-click)
- [ ] Display legal moves visually
- [ ] Add polling loop (GET /api/games/:id every 1-2s)

### Phase 3: Power Cards
- [ ] Display card hand (3 cards)
- [ ] Implement card play button
- [ ] Show active effects on board
- [ ] Handle effect duration visually

### Phase 4: Polish
- [ ] Game over screen (winner display)
- [ ] Error handling & toasts
- [ ] Loading states
- [ ] Responsive design

---

## Development Workflow

### 1. Backend Already Running?
```bash
cd backend
npm run start:dev
# API at http://localhost:3000/api
```

### 2. Create Frontend App
```bash
# In root directory
npx create-next-app@latest frontend --typescript --tailwind

cd frontend
npm run dev
# App at http://localhost:3000
```

### 3. Create API Client
```typescript
// frontend/src/lib/api.ts
const API_BASE = 'http://localhost:3000/api';

export async function apiFetch(path: string, options = {}) {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// Usage:
const game = await apiFetch('/games/game-id');
const moved = await apiFetch('/games/game-id/move', {
  method: 'POST',
  body: JSON.stringify({ from: 'e2', to: 'e4' }),
});
```

---

## How Game Flow Works

### Online Game (Real-time)

```
User A                          User B
    │                              │
    ├─ Register/Login             │
    │         └──────────────────→ Both get JWT tokens
    │
    ├─ Create game ("online")
    │         └──────────────────→ Returns roomCode + 3 cards
    │
    ├─ Share roomCode with opponent
    │         ←───────────────────┤ User B joins with roomCode
    │
    ├─ Move 1.e2-e4
    │         └──────────────────→ Backend validates, updates FEN
    │         ←───────────────────┤ User B polls GET /games/:id
    │
    ├─ User B moves
    │         ←───────────────────┤ Returns new board state
    │         └──────────────────→ User A polls GET /games/:id
    │
    ├─ User A uses "Skip Turn" card
    │         └──────────────────→ Effect added to activeEffects
    │         ←───────────────────┤ User B sees effect, loses turn
    │
    └─ Checkmate!
              └──────────────────→ Game status = "completed"
                                  winnerId = User A
```

### Polling Pattern (Until WebSocket)
```typescript
// frontend/src/hooks/useGameState.ts
useEffect(() => {
  const interval = setInterval(async () => {
    const game = await apiFetch(`/games/${gameId}`);
    setGame(game);
    
    // Check if it's your turn
    const yourTurn = (game.currentTurn === 'white' && youAreHost) ||
                     (game.currentTurn === 'black' && !youAreHost);
    setIsYourTurn(yourTurn);
  }, 1000); // Poll every 1 second
  
  return () => clearInterval(interval);
}, [gameId]);
```

---

## Important Notes for Frontend Dev

1. **FEN Format:** Board state is in FEN notation (e.g., "rnbqkbnr/pppppppp/8/...")
   - Use `chess.js` library to parse FEN to board array
   - Or implement FEN parser yourself

2. **Active Effects:** Track turnsRemaining for visual feedback
   ```json
   {
     "type": "skip_turn",
     "pieceSquare": null,
     "turnsRemaining": 1,
     "appliedBy": "opponent-uuid"
   }
   ```

3. **Turn Management:** Backend tracks whose turn it is
   - Don't submit moves on opponent's turn
   - Check `game.currentTurn` before enabling move input

4. **Error Handling:** All errors follow this format:
   ```json
   {
     "statusCode": 400,
     "message": "Illegal move: e2 to e5",
     "error": "Bad Request"
   }
   ```

5. **Polling vs WebSocket:**
   - MVP: Use polling (GET /api/games/:id every 1-2s)
   - Later: Switch to WebSocket for true real-time (optional)

---

## File Structure

```
checkmate-uno/
├── backend/                     ← NestJS API (✅ Complete)
│   ├── src/
│   │   ├── auth/                ← Auth module
│   │   ├── games/               ← Game logic
│   │   ├── chess/               ← Chess.js wrapper (✅ Tested)
│   │   ├── database/            ← Prisma
│   │   └── common/              ← Types & interfaces
│   ├── prisma/
│   │   └── schema.prisma        ← Database schema
│   └── package.json
│
├── frontend/                    ← Next.js React (📅 Ready to Start)
│   ├── src/
│   │   ├── app/                 ← Pages
│   │   ├── components/          ← React components
│   │   └── lib/
│   │       └── api.ts           ← API client
│   └── package.json
│
├── BACKEND_STATUS.md            ← Progress summary
├── BACKEND_API_REFERENCE.md     ← API spec
├── BACKEND_QUICK_START.md       ← Quick reference
├── SUPABASE_SETUP.md            ← Database setup
└── README.md                    ← This file
```

---

## Next Steps

### Phase 3: Integration (Immediate Priority)
1. Set up Supabase project
2. Run `npx prisma migrate dev --name init`
3. Resolve the Jest ESM configuration issue (`import.meta.url`) in the backend tests.
4. Run Integration Tests (Backend + Database)

### Phase 4: UI Components (Frontend Dev)
1. Read [`FRONTEND_DEVELOPMENT.md`](./FRONTEND_DEVELOPMENT.md) and [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md)
2. Verify Next.js scaffolding
3. Build chess board UI
4. Implement move input system
5. Add Card hand UI
6. Implement Game Over screen

---

## Resources

- **Chess.js:** https://github.com/jhlywa/chess.js
- **Prisma:** https://www.prisma.io/docs/
- **NestJS:** https://docs.nestjs.com/
- **Supabase:** https://supabase.com/docs
- **Next.js:** https://nextjs.org/docs

---

## Questions?

- **Backend API:** See [`BACKEND_API_REFERENCE.md`](./BACKEND_API_REFERENCE.md)
- **Frontend Setup:** See [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md)
- **Game Rules:** See project documentation folder
- **Architecture:** See [`BACKEND_STATUS.md`](./BACKEND_STATUS.md)

**Ready to start? Read [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md) →**
