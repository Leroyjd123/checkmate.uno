# Phase 4 Kick-Off - Frontend API Integration

**Date:** May 16, 2026  
**Duration Estimate:** 6-8 hours  
**Lead:** Frontend Agent  
**Support:** Backend Agent (API debugging if needed)  
**Coordination:** Full Stack Agent

---

## 📋 Overview

Phase 4 transforms the working local game into a fully integrated multiplayer experience by connecting the frontend to the backend API.

**Phase 3 Prerequisite (Completed When):**
- Backend server running at `http://localhost:3000/api`
- All 5 integration tests passing
- Supabase PostgreSQL connected with 4 tables
- WebSocket gateway operational

**Phase 4 Deliverable:**
- Fully playable 2-player online chess game
- Real-time WebSocket synchronization
- Game history persisted to database
- MVP ready for demo/launch

---

## 🎯 Phase 4 Success Criteria

### Must Have (MVP)
- [ ] Users can register and login via UI
- [ ] Users can create online games and get room codes
- [ ] Users can join games with room codes
- [ ] Two players can play complete games together
- [ ] Moves sync in real-time between browsers
- [ ] Checkmate ends game and shows winner
- [ ] Game history recorded in database
- [ ] No console errors (browser or server)
- [ ] All TypeScript strict mode passing

### Should Have (Nice to Have)
- [ ] Power cards work in multiplayer
- [ ] Game statistics persist to database
- [ ] Game replay/history viewer
- [ ] Disconnect handling and reconnection
- [ ] Elo rating system

### Won't Have (Phase 5)
- [ ] Mobile app
- [ ] Chat in-game
- [ ] Animations/transitions
- [ ] Account statistics/profile

---

## 🏗️ Phase 4 Architecture

```
Frontend (Next.js React)
    ├── AuthContext → API /auth/login, /auth/register
    ├── GameContext → API /api/games, /api/games/:id/move
    ├── WebSocketContext → Socket.io events
    └── Pages
        ├── /auth/login (already built)
        ├── /auth/register (already built)
        ├── /lobby (partially built)
        └── /game/[gameId] (needs API integration)
         
         ↓ REST + WebSocket
         
Backend (NestJS)
    ├── AuthController → JWT tokens
    ├── GamesController → CRUD + move validation
    ├── ChessService → FEN manipulation, move logic
    ├── WebSocket Gateway → Real-time sync
    └── Database (Prisma)
        ├── users table
        ├── games table
        ├── game_cards table
        └── moves table
        
        ↓ PostgreSQL
        
Supabase PostgreSQL Database
```

---

## 🎯 Milestone 1: User Authentication (1-2 hours)

### Objective
Frontend connects to `/api/auth/login` and `/api/auth/register`, stores tokens, and manages user session.

### User Story
```
As a user:
I can register with email/password
I can login with credentials
Tokens are stored securely
I stay logged in across page refreshes
I can logout and return to homepage
```

### Tasks

#### 1.1 Update AuthContext with API calls
**File:** `frontend/src/contexts/AuthContext.tsx`

**Required Changes:**
```typescript
// Add login function that calls API
const login = useCallback(async (email: string, password: string) => {
  try {
    const response = await api.auth.login({ email, password });
    dispatch({
      type: 'LOGIN',
      payload: {
        user: response.user,
        token: response.accessToken,
      },
    });
    // Store token in localStorage for persistence
    localStorage.setItem('auth_token', response.accessToken);
  } catch (error) {
    dispatch({ type: 'LOGIN_ERROR', payload: error.message });
  }
}, []);

// Add register function that calls API
const register = useCallback(async (email: string, password: string) => {
  try {
    const response = await api.auth.register({ email, password });
    dispatch({
      type: 'REGISTER',
      payload: {
        user: response.user,
        token: response.accessToken,
      },
    });
    localStorage.setItem('auth_token', response.accessToken);
  } catch (error) {
    dispatch({ type: 'REGISTER_ERROR', payload: error.message });
  }
}, []);

// Add logout that clears token
const logout = useCallback(() => {
  dispatch({ type: 'LOGOUT' });
  localStorage.removeItem('auth_token');
}, []);

// On mount, restore token from localStorage
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // Optionally verify token with backend /me endpoint
    dispatch({ type: 'RESTORE_TOKEN', payload: token });
  }
}, []);
```

**Acceptance Criteria:**
- [ ] Login calls `/api/auth/login` with email/password
- [ ] Register calls `/api/auth/register` with email/password
- [ ] Token stored in localStorage
- [ ] Token included in all future API requests (Authorization header)
- [ ] Logout clears token and redirects to homepage

#### 1.2 Update Login and Register Pages
**Files:** 
- `frontend/src/app/auth/login/page.tsx`
- `frontend/src/app/auth/register/page.tsx`

**Required Changes:**
```typescript
// In login page:
const handleSubmit = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    await login(email, password);
    // Redirect to lobby on success
    router.push('/lobby');
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Add loading state to submit button
<Button disabled={isLoading}>
  {isLoading ? 'Logging in...' : 'Login'}
</Button>

// Add error message display
{error && <Alert variant="error">{error}</Alert>}
```

**Acceptance Criteria:**
- [ ] Login page calls `useAuth().login()` on form submit
- [ ] Shows loading state during API call
- [ ] Shows error message if login fails
- [ ] Redirects to `/lobby` on success
- [ ] Register page same pattern for `useAuth().register()`

#### 1.3 Test Authentication Flow
**Manual Testing:**
```
1. Open http://localhost:3000
2. Click "Register" or go to /auth/register
3. Enter: test@test.com / TestPass123!
4. See loading state, then redirect to /lobby
5. Verify in Supabase console: users table has new user
6. Logout and login with same credentials
7. Verify token stored and restored on page refresh
```

**Expected Results:**
- [ ] New user created in database
- [ ] JWT token received and stored
- [ ] Token persists across page refresh
- [ ] Can logout and login multiple times
- [ ] Error messages display on invalid credentials

---

## 🎮 Milestone 2: Game Creation & Joining (1-2 hours)

### Objective
Users can create games, get room codes, and join games via codes.

### User Story
```
As a player:
I can click "Create Game" and start a new game
I get a room code I can share
Another player can paste the code and join
We see each other's board state
```

### Tasks

#### 2.1 Update GameContext with Game Creation
**File:** `frontend/src/contexts/GameContext.tsx`

**Required Changes:**
```typescript
// Add game creation function
const createGame = useCallback(async (mode: 'local' | 'online') => {
  try {
    const response = await api.games.create({ mode });
    dispatch({
      type: 'INITIALIZE_GAME',
      payload: response,
    });
    return response; // Return gameId for redirect
  } catch (error) {
    dispatch({ type: 'GAME_ERROR', payload: error.message });
    throw error;
  }
}, []);

// Add game join function
const joinGame = useCallback(async (roomCode: string) => {
  try {
    const response = await api.games.join({ room_code: roomCode });
    dispatch({
      type: 'INITIALIZE_GAME',
      payload: response,
    });
    return response.id; // Return gameId for redirect
  } catch (error) {
    dispatch({ type: 'GAME_ERROR', payload: error.message });
    throw error;
  }
}, []);

// Add game fetch function
const loadGame = useCallback(async (gameId: string) => {
  try {
    const response = await api.games.get(gameId);
    dispatch({
      type: 'SYNC_GAME',
      payload: response,
    });
  } catch (error) {
    dispatch({ type: 'GAME_ERROR', payload: error.message });
  }
}, []);
```

**Acceptance Criteria:**
- [ ] `createGame()` calls `POST /api/games`
- [ ] Returns game object with `id`, `room_code`, `board_state`
- [ ] `joinGame()` calls `POST /api/games/join`
- [ ] Takes room code, returns joined game state
- [ ] `loadGame()` calls `GET /api/games/:id`
- [ ] Syncs game state to GameContext

#### 2.2 Update Lobby Page
**File:** `frontend/src/app/lobby/page.tsx`

**Required Changes:**
```typescript
// Create Game Button Handler
const handleCreateGame = async () => {
  setIsLoading(true);
  try {
    const game = await createGame('online');
    // Show room code in modal/toast
    setRoomCode(game.room_code);
    // Copy to clipboard
    navigator.clipboard.writeText(game.room_code);
  } catch (error) {
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};

// Join Game Handler
const handleJoinGame = async () => {
  setIsLoading(true);
  try {
    const game = await joinGame(roomCodeInput);
    // Redirect to game
    router.push(`/game/${game.id}`);
  } catch (error) {
    setError('Invalid room code or game full');
  } finally {
    setIsLoading(false);
  }
};
```

**Acceptance Criteria:**
- [ ] "Create Room" button calls `createGame()`
- [ ] Room code displayed and copyable
- [ ] "Join Room" input accepts room code
- [ ] Joins game and redirects to `/game/[gameId]`
- [ ] Error handling for invalid codes
- [ ] Loading states during API calls

#### 2.3 Test Game Creation & Joining
**Manual Testing:**
```
Browser 1:
1. Login as alice@example.com
2. Go to /lobby
3. Click "Create Room"
4. See room code displayed (e.g., ABC123)
5. Copy room code

Browser 2:
1. Login as bob@example.com
2. Go to /lobby
3. Click "Join Room"
4. Paste room code: ABC123
5. Click "Join"
6. Redirect to /game/[gameId]

Both Browsers:
7. Should see same game state
8. Should see each other as opponent
9. Verify game created in Supabase console
```

**Expected Results:**
- [ ] Game created in `games` table with unique `room_code`
- [ ] Both players joined with correct `host_id` and `opponent_id`
- [ ] Both see identical `board_state`
- [ ] Both see correct `current_turn`

---

## ♟️ Milestone 3: Move Execution (2-3 hours)

### Objective
Players can make moves that sync in real-time to opponent.

### User Story
```
As a player:
I can click a piece and see legal moves
I can move the piece to a legal square
The move is validated by the server
My opponent sees my move immediately
```

### Tasks

#### 3.1 Update Game Page - Load Game State
**File:** `frontend/src/app/game/[gameId]/page.tsx`

**Required Changes:**
```typescript
// On component mount, load game from API
useEffect(() => {
  const gameId = use(params).id;
  
  const loadInitialState = async () => {
    try {
      setIsLoading(true);
      const gameState = await api.games.get(gameId);
      dispatch({
        type: 'SYNC_GAME',
        payload: gameState,
      });
    } catch (error) {
      setError('Failed to load game');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (gameId) {
    loadInitialState();
  }
}, [gameId, dispatch]);

// Join WebSocket room
useEffect(() => {
  const gameId = use(params).id;
  if (gameId && socket) {
    socket.emit('join_room', { game_id: gameId });
  }
}, [gameId, socket]);
```

**Acceptance Criteria:**
- [ ] Loads game state on page load
- [ ] Shows loading spinner during load
- [ ] Board displays correct FEN from API
- [ ] Current turn matches server
- [ ] WebSocket room joined
- [ ] Error shown if game not found

#### 3.2 Update Move Handler - Call API
**File:** `frontend/src/app/game/[gameId]/page.tsx`

**Required Changes:**
```typescript
// Replace local-only move logic with API call
const handleSquareClick = async (from: string, to: string) => {
  // Check if legal move (local validation first for UX)
  const legalMoves = getLegalMovesFromFEN(game.board_state, from);
  if (!legalMoves.includes(to)) {
    return; // Not a legal move
  }
  
  // Optimistically update UI
  const previousState = cloneDeep(game);
  const newFEN = generateNewFEN(game.board_state, from, to);
  dispatch({
    type: 'UPDATE_BOARD',
    payload: { board_state: newFEN },
  });
  
  setIsLoading(true);
  
  try {
    // Send move to server
    const response = await api.games.move(gameId, { from, to });
    
    // Server response becomes source of truth
    dispatch({
      type: 'SYNC_GAME',
      payload: response.gameState,
    });
    
    // Increment local move count
    incrementMoveCount();
    
    // Check for checkmate
    if (response.gameState.status === 'checkmate') {
      setWinner(game.current_turn); // Current turn won
      setGameOver(true);
    }
  } catch (error) {
    // Revert optimistic update on error
    dispatch({
      type: 'SYNC_GAME',
      payload: previousState,
    });
    setError(error.response?.data?.message || 'Move failed');
  } finally {
    setIsLoading(false);
  }
};
```

**Pattern: Optimistic Updates**
```
1. User clicks move
2. Validate locally (fast feedback)
3. Update UI immediately (optimistic)
4. Send to server
5. On success: Use server response as source of truth
6. On error: Revert UI to previous state, show error
```

**Acceptance Criteria:**
- [ ] Local validation prevents illegal moves
- [ ] UI updates immediately (optimistic)
- [ ] Move sent to `POST /api/games/:id/move`
- [ ] Server response syncs to GameContext
- [ ] Error reverts UI and shows message
- [ ] Checkmate detected from response
- [ ] Move counter increments
- [ ] Opponent sees move via WebSocket

#### 3.3 Add WebSocket Move Listener
**File:** `frontend/src/contexts/GameContext.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  // Listen for opponent's moves
  socket.on('move_made', (data) => {
    // data = { gameId, boardState, currentTurn, ... }
    dispatch({
      type: 'SYNC_GAME',
      payload: data.gameState,
    });
  });
  
  socket.on('game_over', (data) => {
    // data = { gameId, winner, ... }
    dispatch({
      type: 'GAME_OVER',
      payload: { winner: data.winner },
    });
  });
  
  return () => {
    socket.off('move_made');
    socket.off('game_over');
  };
}, [socket, dispatch]);
```

**Acceptance Criteria:**
- [ ] Listens for `move_made` WebSocket event
- [ ] Syncs opponent's moves to board
- [ ] Updates turn immediately
- [ ] Listens for `game_over` event
- [ ] Handles no listeners until socket ready

#### 3.4 Test Move Execution
**Manual Testing:**
```
Two Browsers (alice vs bob):
1. Both logged in, both in same game
2. Alice (white) makes move e2→e4
   - Sees move immediately (optimistic)
   - Move sent to API
   - Gets checksum back
3. Bob (black) sees move appear (WebSocket)
   - Board updates
   - Turn indicator changes
4. Bob makes move c7→c5
   - Alice sees move immediately (WebSocket)
5. Play 5+ moves each
6. Verify all moves persisted in database
```

**Expected Results:**
- [ ] All moves sync between browsers <100ms
- [ ] Moves persisted to `moves` table
- [ ] Board state consistent across browsers
- [ ] Turn alternates correctly
- [ ] No console errors

---

## 🎴 Milestone 4: Power Cards (1-2 hours)

### Objective
Players can use power cards that affect board state.

### User Story
```
As a player:
I can see my 3 power cards in hand
I can click a card to use it
The card effect applies to the board
My opponent sees the effect immediately
```

### Tasks

#### 4.1 Update Card Handler - Call API
**File:** `frontend/src/app/game/[gameId]/page.tsx`

**Required Changes:**
```typescript
// Replace local-only card logic with API call
const handleCardClick = async (cardId: string, targetSquare?: string) => {
  if (!isPlayerTurn || gameOver) return;
  
  // Optimistically mark card as used
  const previousState = cloneDeep(game);
  dispatch({
    type: 'MARK_CARD_USED',
    payload: { cardId },
  });
  
  setIsLoading(true);
  
  try {
    // Send card use to server
    const response = await api.games.useCard(gameId, {
      card_id: cardId,
      target_square: targetSquare,
    });
    
    // Sync game state with server response
    dispatch({
      type: 'SYNC_GAME',
      payload: response.gameState,
    });
    
    // Show feedback
    setCardMessage(`${response.card.card_type} card used!`);
    setTimeout(() => setCardMessage(null), 2000);
    
    // Increment card counter
    incrementCardsUsed();
  } catch (error) {
    // Revert optimistic update
    dispatch({
      type: 'SYNC_GAME',
      payload: previousState,
    });
    setError(error.response?.data?.message || 'Card use failed');
  } finally {
    setIsLoading(false);
  }
};
```

**Acceptance Criteria:**
- [ ] Card click calls `POST /api/games/:id/use-card`
- [ ] Sends `card_id` and optional `target_square`
- [ ] Server response contains updated game state
- [ ] Optimistic update reverts on error
- [ ] Feedback message shows card used
- [ ] Card marked as used (disabled)
- [ ] Card counter increments

#### 4.2 Add WebSocket Card Listener
**File:** `frontend/src/contexts/GameContext.tsx`

**Required Changes:**
```typescript
useEffect(() => {
  socket.on('card_used', (data) => {
    // data = { gameId, playerId, card, effect, ... }
    dispatch({
      type: 'SYNC_GAME',
      payload: data.gameState,
    });
    // Optional: Show notification to opponent
    showNotification(`Opponent used ${data.card.card_type} card`);
  });
  
  return () => {
    socket.off('card_used');
  };
}, [socket, dispatch]);
```

**Acceptance Criteria:**
- [ ] Listens for `card_used` WebSocket event
- [ ] Syncs opponent's card effects
- [ ] Shows notification to opponent
- [ ] Board state updated with effects

#### 4.3 Test Power Cards
**Manual Testing:**
```
Two Browsers:
1. Play until someone has a card option
2. Player 1 uses a power card
   - Card marked as used
   - Shows feedback message
   - Board state changes (if applicable)
3. Player 2 sees effect immediately (WebSocket)
4. Try all 8 card types if possible
5. Verify effects in active_effects array
```

**Expected Results:**
- [ ] Cards sync between browsers
- [ ] Card effects apply correctly
- [ ] Cards marked as used
- [ ] Effects recorded in database

---

## ✨ Milestone 5: Polish & Testing (1-2 hours)

### Objective
Game is fully playable and ready for demo.

### Tasks

#### 5.1 Checkmate Detection & Game Over
**Expected:** Game over modal displays when checkmate detected
- [ ] Backend detects checkmate
- [ ] Sends `game_over` WebSocket event
- [ ] Frontend shows GameOver modal
- [ ] Winner announced correctly
- [ ] Stats display (moves, cards, duration)

#### 5.2 No Console Errors
**Testing:**
- [ ] Open DevTools Console (F12)
- [ ] Play full game
- [ ] Check: No red error messages
- [ ] Check: No WebSocket errors
- [ ] Check: No CORS errors
- [ ] Check: No 404s for assets

**Acceptance Criteria:**
- [ ] Console is clean (warnings okay, errors not okay)

#### 5.3 Responsive Design
**Testing on different screen sizes:**
- [ ] Desktop (1920×1080) - ✅ Works
- [ ] Tablet (768×1024) - ✅ Responsive
- [ ] Mobile (375×667) - ✅ Playable
- [ ] Board scales correctly
- [ ] Cards stack or scroll appropriately

#### 5.4 Dark Mode
**Testing:**
- [ ] Toggle theme in top right
- [ ] Board readable in both themes
- [ ] Cards visible in both themes
- [ ] Text contrast acceptable

#### 5.5 Performance
**Testing:**
- [ ] Moves feel instant (<100ms)
- [ ] No lag when opponent moves
- [ ] No memory leaks (check DevTools Performance)
- [ ] WebSocket reconnects automatically

---

## 🧪 Phase 4 Complete Testing Plan

See `frontend/PHASE_4_TESTING_PLAN.md` for comprehensive test scenarios.

**Quick Test Checklist:**
```
1. ✅ Authentication
   - Register new user
   - Login with credentials
   - Token persists across refresh
   
2. ✅ Game Creation
   - Create room
   - Get room code
   - Another player joins with code
   
3. ✅ Move Execution
   - Make 5+ moves each
   - Moves sync between browsers
   - Turn alternates correctly
   
4. ✅ Power Cards
   - Use a card
   - Opponent sees effect
   - Cards marked as used
   
5. ✅ Game Completion
   - Play to checkmate
   - Game over modal displays
   - Stats show correctly
   - Play again button works
   
6. ✅ Error Handling
   - Stop backend
   - Try to move (should error)
   - Restart backend
   - Move succeeds
   
7. ✅ WebSocket Reconnection
   - Play game normally
   - Disconnect WebSocket in DevTools
   - Make move (should show reconnecting)
   - Reconnect (move sends)
```

---

## 📊 Phase 4 Task Summary

| Milestone | Lead | Duration | Est. Completion |
|-----------|------|----------|-----------------|
| 1: Authentication | Frontend | 1-2 hrs | +1-2h |
| 2: Game Creation | Frontend | 1-2 hrs | +2-4h |
| 3: Move Execution | Frontend | 2-3 hrs | +4-7h |
| 4: Power Cards | Frontend | 1-2 hrs | +5-9h |
| 5: Polish | Frontend | 1-2 hrs | +6-11h |
| **Phase 4 Total** | **Frontend** | **6-8 hrs** | **Today** |

---

## 🚀 Success Definition

Phase 4 is **COMPLETE** when:

✅ Two players can register and login  
✅ Players can create games and get room codes  
✅ Players can join games with room codes  
✅ Players can play complete games start to finish  
✅ Moves sync in real-time between browsers  
✅ Checkmate detected and game over shown  
✅ Power cards work in multiplayer  
✅ Game history persisted to database  
✅ No console errors (browser or server)  
✅ Build and TypeScript passing  
✅ Ready for MVP demo/launch  

---

## 📞 Support During Phase 4

**If you encounter issues:**

| Issue | Solution |
|-------|----------|
| "Cannot POST /api/games" | Backend not running or port wrong |
| "401 Unauthorized" | Token not sent in header or expired |
| "WebSocket connection failed" | Backend CORS not configured for your host |
| "GameContext is undefined" | Ensure GameProvider wraps entire app |
| "Board state not syncing" | Check WebSocket events in backend logs |
| "Checkmate not detected" | Backend ChessService error; check backend logs |

**Get Help:**
1. Check backend logs: `npm run start:dev` output
2. Check browser console: F12 → Console tab
3. Check backend database: `npx prisma studio`
4. Ask Full Stack Agent for coordination

---

## ✅ Handoff Criteria

Phase 4 is ready to **begin** when:

✅ Phase 3 complete (PHASE_3_VERIFICATION.md signed off)  
✅ Backend running without errors  
✅ All 5 integration tests passing  
✅ Frontend builds successfully  
✅ Frontend pages ready (auth, lobby, game)  
✅ This document reviewed and understood  

---

**Created:** May 16, 2026  
**By:** Full Stack Agent  
**Status:** ✅ Ready for Phase 4 Kick-Off  
**Next Step:** Await Backend Agent Phase 3 completion, then Frontend Agent begins Milestone 1
