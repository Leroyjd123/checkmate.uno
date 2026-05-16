# Phase 2 Integration Plan - Frontend & Backend Sync

**Status:** Both Frontend & Backend Phase 1/2 Complete ✅  
**Current Date:** May 16, 2026  
**Next Phase:** Phase 3 - Full Integration & Core Gameplay  

---

## Executive Summary

### What's Ready

**Backend Delivery:**
✅ Complete REST API with all endpoints  
✅ WebSocket real-time sync  
✅ 27 unit tests passing  
✅ 5000+ lines of documentation  
✅ Prisma schema ready for migration  

**Frontend Delivery:**
✅ 5 core UI components (Button, Card, Input, PowerCard, ChessBoard)  
✅ 4 context providers wired (Auth, Game, Theme, WebSocket)  
✅ API client configured with auth headers  
✅ Chess.js wrapper with full utilities  
✅ All pages scaffolded  
✅ Component showcase at `/components`  

**Status:** Both sides ready for integration → **Phase 3 can begin immediately**

---

## Phase 3 Timeline (Next 2-4 Weeks)

### Week 1: Database & Integration Setup

**Day 1-2: Database Setup (2-3 hours)**
```bash
# Backend team OR user must:
1. Create Supabase project at supabase.com
2. Get DATABASE_URL connection string
3. Run: cd backend && npx prisma migrate dev --name init
4. Verify schema created: users, games, game_cards, moves tables
```

**Day 2-3: Start Both Servers (1 hour)**
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev
# Runs on http://localhost:3000/api

# Terminal 2 - Frontend
cd frontend
npm run dev
# Runs on http://localhost:3000
```

**Day 3-4: Integration Testing (4-6 hours)**
- Follow `INTEGRATION_CHECKLIST.md` from backend docs
- Test: register → login → create game → make move → use card
- Verify WebSocket real-time sync
- Check all error handling

**Day 5: Debug & Polish (2-3 hours)**
- Fix any API integration issues
- Verify error messages display correctly
- Test on multiple browsers

---

### Week 2-3: Core Gameplay Components

**GameBoard Component (8-10 hours)**
- Render board from FEN state
- Click-to-select-move or drag-and-drop
- Show legal move highlights (green)
- Show selected piece (yellow)
- Call `makeMove()` on move execution
- Display checkmate/check status

**Power Cards Hand (4-5 hours)**
- Display 3-card hand
- Show card descriptions on hover
- Click card → show valid targets
- Execute card effect on target selection
- Remove used card from hand

**Active Effects UI (3-4 hours)**
- Highlight pieces with active effects
- Show effect icons (skip, freeze, shield)
- Display remaining turn count for effects
- Animate effect application

**Game Over Screen (2-3 hours)**
- Show winner announcement
- Display game stats
- "Play Again" button
- Move replay option

**Total: 17-22 hours (2-3 weeks at 8 hours/day)**

---

### Week 4: Polish & Testing

- Mobile responsiveness
- Accessibility (a11y)
- Animation & transitions
- Performance optimization
- Bug fixes & edge cases

---

## Integration Architecture

### Data Flow

```
┌─────────────────────────────────────────┐
│         React Components                │
│  (GameBoard, PowerCard, Input, etc)     │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────────┐
        │  Game Context   │ (Manages game state)
        └──────┬──────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼─────┐     ┌──────▼────┐
│ useAuth  │     │ useWebSocket│
│ (JWT)    │     │ (Real-time) │
└────┬─────┘     └──────┬─────┘
     │                  │
     └──────┬───────────┘
            │
     ┌──────▼────────────────┐
     │   Backend API         │
     │  REST + WebSocket     │
     │  (NestJS on :3000)    │
     └──────┬────────────────┘
            │
     ┌──────▼────────────────┐
     │  Supabase Database    │
     │  (Postgres)           │
     └───────────────────────┘
```

### Key Integrations

**1. Authentication Flow**
```
Register/Login → JWT Token → Store in Cookie → Attach to API Calls
```

**2. Game Creation & Joining**
```
User Clicks "Create Game" → API POST /api/games → Get gameId
  → Redirect to /game/[gameId] → Load game state
```

**3. Move Execution**
```
User Clicks Square → Check Legal Moves → Call API → Backend Validates
  → Updates Board → WebSocket Broadcast → Update Game Context
  → Re-render Board
```

**4. Real-time Multiplayer**
```
Player A Makes Move → WebSocket Event → Backend Broadcast
  → Player B Receives Event → Update Game Context → Re-render
```

---

## Frontend Development Checklist - Phase 3

### Week 1: Setup & Auth

- [ ] Verify Supabase is configured (DATABASE_URL in backend .env)
- [ ] Backend migrations run successfully
- [ ] Start backend: `npm run start:dev`
- [ ] Test backend health: curl http://localhost:3000/api/health
- [ ] Verify frontend can call API: Test register endpoint
- [ ] Check JWT token is stored in httpOnly cookie
- [ ] Verify auth context loads user on page refresh
- [ ] Test login/logout flow end-to-end

### Week 1-2: Game Integration

- [ ] Wire up `/lobby` page to backend
  - [ ] "Create Game" button calls `POST /api/games`
  - [ ] "Join Game" button calls `POST /api/games/join`
  - [ ] Room codes display correctly
- [ ] Wire up `/game/[gameId]` page
  - [ ] Load game state with `GET /api/games/:id`
  - [ ] Update Game Context with fetched state
  - [ ] Display opponent info (if online mode)
  - [ ] Show room code for online games
- [ ] Test local game workflow
  - [ ] Create game → Load board → Make move → See board update
- [ ] Test online game workflow
  - [ ] Create online game → Share code → Join from another window
  - [ ] Move made by player A → See on player B's board

### Week 2-3: Core Gameplay

- [ ] Build GameBoard component
  - [ ] Render squares and pieces from FEN
  - [ ] Handle square clicks (select piece)
  - [ ] Show legal moves on piece selection
  - [ ] Execute move: `POST /api/games/:id/move`
  - [ ] Update board after move
- [ ] Implement power cards
  - [ ] Display 3-card hand
  - [ ] Show card descriptions
  - [ ] Execute card: `POST /api/games/:id/use-card`
  - [ ] Remove used card from hand
  - [ ] Update opponent's view
- [ ] Add game status display
  - [ ] Show whose turn it is
  - [ ] Show check status
  - [ ] Show checkmate/stalemate detection
  - [ ] Show game over screen

### Week 3-4: Real-time & Polish

- [ ] WebSocket integration
  - [ ] Connect to WebSocket on game load
  - [ ] Listen for `move_made` events
  - [ ] Listen for `card_used` events
  - [ ] Listen for `game_over` events
  - [ ] Handle opponent disconnect/reconnect
- [ ] Animations & UX
  - [ ] Animate piece moves
  - [ ] Highlight affected squares
  - [ ] Show effect animations (skip, freeze, etc)
  - [ ] Add loading states during API calls
- [ ] Mobile responsiveness
  - [ ] Test board on mobile devices
  - [ ] Adjust card size/spacing
  - [ ] Test touch drag-and-drop
- [ ] Accessibility
  - [ ] WCAG color contrast (minimum 4.5:1 for text)
  - [ ] Keyboard navigation
  - [ ] ARIA labels for game elements

---

## Files You'll Be Working With

### Main Development Files

```
frontend/src/
├── contexts/
│   ├── AuthContext.tsx          ← Wire login/register
│   ├── GameContext.tsx          ← Core game state
│   ├── WebSocketContext.tsx     ← Real-time sync
│   └── ThemeContext.tsx         ← Theme management
│
├── lib/
│   ├── api.ts                   ← API client (already configured)
│   ├── socket.ts                ← WebSocket wrapper
│   └── chess.ts                 ← Chess logic utilities
│
├── app/
│   ├── auth/
│   │   ├── login/page.tsx       ← Wire to useAuth
│   │   └── register/page.tsx    ← Wire to useAuth
│   ├── lobby/page.tsx           ← Wire to game creation
│   ├── game/[gameId]/page.tsx   ← Wire to game state
│   └── components/page.tsx      ← Design testing (already done)
│
└── components/
    ├── GameBoard.tsx            ← NEW: Build this
    ├── PowerCardHand.tsx        ← NEW: Build this
    ├── GameStatus.tsx           ← NEW: Build this
    ├── GameOverModal.tsx        ← NEW: Build this
    ├── ActiveEffects.tsx        ← NEW: Build this
    └── Button.tsx, Card.tsx, etc ← Use these
```

### Backend Documentation Files (Read These)

From the backend delivery, read in order:

1. **FRONTEND_DEVELOPMENT.md** - How to use the API
2. **BACKEND_QUICK_START.md** - Quick reference
3. **WEBSOCKET_GUIDE.md** - Real-time patterns
4. **INTEGRATION_CHECKLIST.md** - Step-by-step tests
5. **BACKEND_API_REFERENCE.md** - Complete endpoint spec

---

## Critical Integration Points

### 1. Authentication
**Current State:** AuthContext set up, API client ready  
**Next:** 
- Test register endpoint: `POST /api/auth/register`
- Test login endpoint: `POST /api/auth/login`
- Verify JWT token stored in cookie
- Test token refresh on page reload

### 2. Game State Management
**Current State:** GameContext has reducer, but no real data  
**Next:**
- Hook GameContext to fetch real game from API
- Update board state when moves received
- Sync power cards with actual game state
- Handle game over conditions

### 3. Real-time Sync
**Current State:** WebSocketContext created, not connected  
**Next:**
- Connect to WebSocket on game load
- Listen for `move_made` events
- Listen for `card_used` events
- Broadcast player moves via WebSocket

### 4. Move Execution
**Current State:** ChessBoard component renders, no interaction  
**Next:**
- Add click handlers to squares
- Call `POST /api/games/:id/move` on move attempt
- Get move validation result from backend
- Update board only if move is valid

### 5. Card Usage
**Current State:** PowerCard component displays, no interaction  
**Next:**
- Add click handlers to cards
- Show targeting UI if card needs target
- Call `POST /api/games/:id/use-card` with target
- Remove used card from hand
- Apply effect visualization

---

## Expected Challenges & Solutions

### Challenge 1: CORS Errors
**Symptom:** Network tab shows CORS errors  
**Solution:** Backend has CORS configured; verify Origin header matches

### Challenge 2: WebSocket Not Connecting
**Symptom:** WebSocket event listeners never fire  
**Solution:** 
- Check WebSocket URL: `ws://localhost:3000`
- Verify auth token is passed
- Check browser console for connection errors

### Challenge 3: FEN Parsing Issues
**Symptom:** Board doesn't render pieces correctly  
**Solution:**
- Use `getAllPieces()` from `lib/chess.ts`
- Verify FEN format from backend matches expected standard
- Test with known FEN positions first

### Challenge 4: Stale Game State
**Symptom:** Your moves don't update opponent's board  
**Solution:**
- Verify WebSocket is connected and listening
- Check event payload matches expected format
- Ensure Game Context is updated on event

---

## Success Criteria - Phase 3 Complete

✅ **Local Game Flow**
- Create game → Board displays → Make move → Board updates → Checkmate ends game

✅ **Online Game Flow**
- Create game → Get room code → Join from another browser → Real-time sync works

✅ **Power Cards**
- Show in hand → Click to use → Effect applies → Card removed from hand

✅ **Error Handling**
- Invalid moves rejected with message
- Network errors show toast notification
- Disconnections handled gracefully

✅ **Real-time Multiplayer**
- Player A makes move → Instant update on Player B's screen
- WebSocket reconnection works
- Turn management synced across players

✅ **No Console Errors**
- Clean browser console
- No unhandled promise rejections
- No auth errors

---

## Quick Reference: Common Tasks

### Making an API Call
```typescript
import { gamesAPI } from '@/lib/api';

// Create game
const game = await gamesAPI.create('online');
console.log(game.id, game.roomCode);

// Make move
const result = await gamesAPI.makeMove(gameId, 'e2', 'e4');
console.log(result.fen); // New board state
```

### Listening to WebSocket Events
```typescript
import { useWebSocket } from '@/contexts/WebSocketContext';

const { socket } = useWebSocket();

socket.on('move_made', (data) => {
  console.log('Opponent moved:', data.from, 'to', data.to);
  // Update game context with new FEN
});
```

### Updating Game State
```typescript
import { useGame } from '@/contexts/GameContext';

const { dispatch } = useGame();

dispatch({
  type: 'UPDATE_GAME',
  payload: {
    fen: newFEN,
    currentTurn: 'white',
  },
});
```

---

## Next Immediate Steps

**Today (May 16):**
1. Read `BACKEND_QUICK_START.md` from backend docs (15 min)
2. Review `WEBSOCKET_GUIDE.md` (15 min)
3. Understand data flow diagram above (10 min)

**Tomorrow (May 17):**
1. Backend team sets up Supabase
2. Run database migrations
3. Start both servers
4. Test integration checklist

**Rest of Week:**
1. Wire authentication
2. Build GameBoard component
3. Implement move execution
4. Add WebSocket listeners

---

## Documentation Map

**You are here:** PHASE_2_INTEGRATION_PLAN.md (this file)

**Read Next (in order):**
1. Backend's `FRONTEND_DEVELOPMENT.md` - Complete integration guide
2. Backend's `BACKEND_QUICK_START.md` - API quick reference
3. Backend's `WEBSOCKET_GUIDE.md` - Real-time patterns
4. Backend's `INTEGRATION_CHECKLIST.md` - Step-by-step tests

**Reference During Development:**
- Backend's `BACKEND_API_REFERENCE.md` - Full endpoint specs
- Frontend's `DESIGN_TESTING_GUIDE.md` - Component library
- Frontend's `STORYBOOK.md` - Component documentation

---

## Final Notes

**What's Different Now vs Yesterday:**
- Before: Frontend & backend built separately
- Now: Both ready for integration
- Next: Connected, functional game

**Key Mindset for Phase 3:**
- Backend is authoritative (trust server for move validation)
- Frontend is display layer (render what backend sends)
- WebSocket = real-time sync (not for game logic)
- Every user action = API call (even local games)

**Success Indicator:**
When you can play a game locally (make moves, use cards, reach checkmate) and see the same state in an online game played by two browsers - Phase 3 is complete.

---

**Created:** May 16, 2026  
**Status:** Ready to Begin Integration  
**Backend Status:** Complete & Documented  
**Frontend Status:** Components & Contexts Ready  
**Next Blocker:** Database Setup (Supabase)  
