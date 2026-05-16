# Checkmate.Uno — Frontend Technical Requirements Document

## Document Metadata

**Module:** Checkmate.Uno Frontend  
**Platform:** Web (Desktop + Mobile Responsive)  
**Document Type:** FRD  
**Version:** v1.0  
**Status:** Draft  
**Last Reviewed:** May 16, 2026  
**Primary Owner:** To be assigned  
**Secondary Owner:** To be assigned  
**Related Module:** Checkmate.Uno Backend API  
**Classification:** Internal

---

## 0. Technical Summary

The Checkmate.Uno frontend is a Next.js 15 web application (App Router) that provides an interactive chess game interface with power card mechanics. It communicates with the NestJS backend via REST API for game state management and Socket.io WebSocket for real-time move synchronization in online multiplayer mode. The frontend handles board rendering, piece movement animations, power card UI, and theme management. All game logic validation occurs server-side; the client acts as a display layer with optimistic UI updates.

Built with: Next.js 15 · React 18 · TypeScript 5 · Tailwind CSS · Socket.io-client · chess.js (client-side visual validation only).

---

## 1. Technical Purpose

This frontend exists as a stateless display and interaction layer for the Checkmate.Uno chess variant game. Its primary technical responsibility is rendering the 8x8 chess board, handling drag-and-drop piece movement, displaying power card UI, and synchronizing real-time game state updates via WebSocket for online multiplayer.

**Why separate from backend:** The backend is the authoritative source for all game logic (move validation, checkmate detection, power card effects). The frontend must never make game state decisions independently — it only reflects server-validated state and sends user actions to the backend for processing. This prevents client-side cheating and ensures consistent game state across all players.

**Core technical problems solved:**
- Real-time board state synchronization between two players over WebSocket
- Smooth drag-and-drop piece movement with legal move highlighting
- Power card activation with target selection UX
- Theme switching without full page reload
- Responsive board rendering for mobile and desktop screens

---

## 2. Scope Boundaries

### This Module Owns

| Responsibility | Description |
|---|---|
| Board rendering | 8x8 chess board with alternating square colors per theme |
| Piece rendering | SVG chess pieces positioned on board squares |
| Piece movement | Drag-and-drop or click-to-select piece movement input |
| Power card UI | Display 3 cards per player, card activation buttons, card removal on use |
| Legal move highlighting | Visual indicators for valid moves (client-side pre-validation only) |
| Active effect icons | Shield and freeze icons overlaid on affected pieces |
| Theme management | Switching between Light/Dark/Neon themes, persisting user preference |
| Turn indicator | Visual display of whose turn it is |
| Winner modal | Display checkmate result with "Play Again" / "Main Menu" options |
| Room code display | Show room code prominently for online games, "Copy Code" button |
| Waiting state | "Waiting for opponent" screen in online mode |
| Authentication UI | Login/register forms |

### Not Included (Owned by Backend or Out of Scope)

| Responsibility | Owner | Why Not Here |
|---|---|---|
| Move validation | Backend API | Authoritative validation must be server-side to prevent cheating |
| Checkmate detection | Backend API | Complex chess logic, must be consistent across all clients |
| Power card effect execution | Backend API | Card effects modify game state, must be validated server-side |
| Room code generation | Backend API | Must ensure uniqueness across all games |
| Game state persistence | Backend API | Database writes for move history, game status |
| AI opponent logic | Backend API | Computer move generation |
| User authentication | Supabase Auth | Handled by backend integration |

**Rationale:** This frontend is a thin display client. All business logic, validation, and state mutations occur on the server. The frontend's only state is "what the user is currently interacting with" (selected piece, card hover) — never "what the game state is."

---

## 3. Participating Systems

| System | Responsibility | Communication Method |
|---|---|---|
| Checkmate.Uno Backend API | Game CRUD, move validation, card execution | REST API (HTTPS) |
| Checkmate.Uno Backend API | Real-time move sync, opponent events | WebSocket (Socket.io) |
| Supabase Auth | User authentication, JWT token generation | REST API via Backend proxy |
| Browser LocalStorage | Theme preference persistence | Native Web API |

---

## 4. Screens and Frontend Touchpoints

### 4.1 Homepage (/)

**Trigger:** User navigates to root URL  
**UI Elements:**
- Game logo/title
- Three mode buttons: "Play Local", "Play vs Computer", "Play Online"
- "How to Play" button (opens rules modal)
- Login/Register buttons (top-right corner)

**User Actions:**
- Click "Play Local" → Navigate to `/game/local` → Create local game immediately (no backend call)
- Click "Play vs Computer" → Navigate to `/game/computer` → Create computer game (POST /api/games)
- Click "Play Online" → Navigate to `/lobby` → Show "Create Room" / "Join Room" options
- Click "Login" → Navigate to `/auth/login`
- Click "Register" → Navigate to `/auth/register`
- Click "How to Play" → Open modal with game rules and card descriptions

---

### 4.2 Lobby Page (/lobby)

**Trigger:** User clicks "Play Online" from homepage  
**UI Elements:**
- Two buttons: "Create Room", "Join Room"
- Back button to homepage

**User Actions:**
- Click "Create Room" → Call POST /api/games {mode: 'online'} → Navigate to `/game/:gameId` with waiting state
- Click "Join Room" → Show input field for room code + "Join" button

---

### 4.3 Join Room Modal (/lobby with modal open)

**Trigger:** User clicks "Join Room" on lobby page  
**UI Elements:**
- Input field: 6-character room code (auto-uppercase)
- "Join" button
- "Cancel" button

**User Actions:**
- User types room code → Input auto-converts to uppercase
- Click "Join" → Call POST /api/games/join {room_code} → Navigate to `/game/:gameId`
- Click "Cancel" → Close modal, return to lobby

---

### 4.4 Game Page (/game/:gameId)

**Trigger:** User starts any game mode  
**UI Elements:**
- 8x8 chess board with pieces
- Player 1 (White) card hand (bottom) — 3 cards, face-up
- Player 2 (Black) card hand (top) — 3 cards (hidden in online mode, face-up in local mode)
- Turn indicator: "White's Turn" or "Black's Turn"
- Room code display (online mode only, top-center, with "Copy Code" button)
- Active effect icons on pieces (shield, freeze)
- Settings button (theme switcher)
- "Forfeit" button (online mode only)

**User Actions:**

**Piece Movement:**
- Click piece → Highlight legal moves (client-side pre-check using chess.js)
- Click destination square → Call POST /api/games/:id/move {from, to} → Wait for response → Update board with animation
- Drag piece → Hover over squares → Drop on destination → Same API call

**Power Card Activation:**
- Click card → Card highlights, cursor changes to targeting mode
- For Shield/Freeze: Click target piece → Call POST /api/games/:id/use-card {card_id, target_data}
- For Teleport: Click piece → Click destination square → Call API
- For Wild Swap: Click first piece → Click second piece → Call API
- For other cards (Skip, Reverse, Extra Move, Sacrifice): Activate immediately on click → Call API
- Card removed from hand after successful use
- Error toast if invalid target selected

**WebSocket Events (Online Mode):**
- Receive `opponent_joined` → Update UI from "Waiting..." to game board
- Receive `move_made` → Animate opponent's move, update board, switch turn indicator
- Receive `card_used` → Remove card from opponent's hand count, update board/effects, show toast "[Card Type] played"
- Receive `game_over` → Show winner modal
- Receive `opponent_disconnected` → Show "Opponent disconnected, waiting for reconnection..." overlay
- Receive `opponent_reconnected` → Hide overlay, resume game

**Settings:**
- Click settings icon → Open theme selector dropdown → Click theme → Update UI immediately, save to localStorage

**Forfeit:**
- Click "Forfeit" → Confirm modal → Call forfeit endpoint (or disconnect) → Navigate to homepage

---

### 4.5 Winner Modal (overlay on /game/:gameId)

**Trigger:** Game ends (checkmate detected)  
**UI Elements:**
- Semi-transparent overlay
- Modal card: "White Wins!" or "Black Wins!" or "You Win!" / "You Lose!"
- Decorative element (crown icon, confetti animation)
- "Play Again" button
- "Main Menu" button

**User Actions:**
- Click "Play Again" → Navigate to homepage
- Click "Main Menu" → Navigate to homepage

---

### 4.6 Login Page (/auth/login)

**Trigger:** User clicks "Login" on homepage  
**UI Elements:**
- Email input field
- Password input field (masked)
- "Login" button
- "Don't have an account? Register" link

**User Actions:**
- User fills form → Click "Login" → Call POST /api/auth/login → Receive JWT → Store in httpOnly cookie → Navigate to homepage
- Click "Register" link → Navigate to `/auth/register`

---

### 4.7 Register Page (/auth/register)

**Trigger:** User clicks "Register" on homepage or login page  
**UI Elements:**
- Email input field
- Password input field (masked)
- Confirm password input field (masked)
- "Register" button
- "Already have an account? Login" link

**User Actions:**
- User fills form → Click "Register" → Validate passwords match → Call POST /api/auth/register → Receive JWT → Store in httpOnly cookie → Navigate to homepage
- Click "Login" link → Navigate to `/auth/login`

---

## 5. Navigation and Routing

### Next.js App Router Structure

```
app/
├── page.tsx (Homepage)
├── lobby/
│   └── page.tsx (Lobby page)
├── game/
│   ├── [gameId]/
│   │   └── page.tsx (Game page — dynamic route)
│   ├── local/
│   │   └── page.tsx (Local game redirect → /game/:id)
│   └── computer/
│       └── page.tsx (Computer game redirect → /game/:id)
└── auth/
    ├── login/
    │   └── page.tsx (Login page)
    └── register/
        └── page.tsx (Register page)
```

### Route Definitions

| Route | File | Auth Required | Description |
|---|---|---|---|
| `/` | `app/page.tsx` | No | Homepage with mode selection |
| `/lobby` | `app/lobby/page.tsx` | Yes | Online game lobby (create/join room) |
| `/game/[gameId]` | `app/game/[gameId]/page.tsx` | Conditional* | Game board and play area |
| `/auth/login` | `app/auth/login/page.tsx` | No | Login form |
| `/auth/register` | `app/auth/register/page.tsx` | No | Register form |

*Auth required for online games, optional for local/computer games

### Deep Link Handling

Not applicable — no deep links in MVP (future: share game links like `/game/:gameId?spectate=true`)

---

## 6. State Management

### React Context API

**Global State (via Context):**
- `AuthContext` — User authentication state, JWT token
- `ThemeContext` — Current theme selection (Light/Dark/Neon)
- `GameContext` — Current game state (board_state, current_turn, active_effects, player_cards)
- `WebSocketContext` — Socket.io connection instance, connection status

**Why Context over Redux:** Simple state structure, no complex async actions beyond API calls, React Context sufficient for small app. Avoids Redux boilerplate.

**State Persistence:**
- Theme preference: localStorage (`theme_preference` key)
- JWT token: httpOnly cookie (managed by backend Set-Cookie header)
- Game state: NOT persisted client-side (always fetched from backend on page load)

**State Flow Example (Move Execution):**
1. User clicks piece → destination
2. Component dispatches optimistic update to GameContext (show piece at new position immediately)
3. Component calls POST /api/games/:id/move
4. On success: update GameContext with server response (authoritative state)
5. On failure: revert optimistic update, show error toast

---

## 7. API Contracts — Client View

### HTTP Clients

**Base URL:** `https://api.checkmate-uno.com` (or `http://localhost:3000` in dev)  
**Library:** Native `fetch` API (no Axios needed for simple REST calls)  
**Authentication:** JWT token sent in `Authorization: Bearer <token>` header (auto-attached via middleware)

### REST Endpoints Called

| Endpoint | Method | Purpose | Request Body | Response |
|---|---|---|---|---|
| `/api/auth/register` | POST | Create account | `{email, password}` | `{user, token}` |
| `/api/auth/login` | POST | Login | `{email, password}` | `{user, token}` |
| `/api/games` | POST | Create game | `{mode}` | `{game, cards}` |
| `/api/games/join` | POST | Join online game | `{room_code}` | `{game, cards}` |
| `/api/games/:id` | GET | Fetch game state | None | `{game, your_cards, opponent_card_count}` |
| `/api/games/:id/move` | POST | Execute move | `{from, to}` | `{board_state, current_turn, is_check, is_checkmate}` |
| `/api/games/:id/use-card` | POST | Use power card | `{card_id, target_data}` | `{board_state, active_effects}` |

### WebSocket Events

**Connection:** `io('https://api.checkmate-uno.com', {auth: {token: jwtToken}})`  
**Rooms:** Client joins room via `socket.emit('join_room', {game_id})`

**Events Received:**

| Event | Payload | Client Action |
|---|---|---|
| `opponent_joined` | `{game_id, opponent_id}` | Update UI from waiting state to game board |
| `move_made` | `{from, to, new_board_state, current_turn, is_check}` | Animate opponent's move, update GameContext |
| `card_used` | `{card_type, target_data, new_board_state, active_effects}` | Show toast, update board, update effects |
| `game_over` | `{winner_id, reason}` | Show winner modal |
| `opponent_disconnected` | `{game_id}` | Show "Waiting for reconnection" overlay |
| `opponent_reconnected` | `{game_id}` | Hide overlay |

**Retry Logic:**
- Socket.io auto-reconnects with exponential backoff (default config)
- On reconnect: re-emit `join_room` to restore room subscription
- If reconnect fails after 5 attempts: show error modal "Connection lost"

---

## 8. Database References

### 8.1 DB Diagram Links

[To be provided — Backend team will share ERD]

---

### 8.2 Tables This Module Reads (via API)

| Table | Via Endpoint | Fields Used | Purpose |
|---|---|---|---|
| `games` | GET /api/games/:id | board_state, current_turn, status, active_effects, winner_id | Render board, turn indicator, game over state |
| `game_cards` | GET /api/games/:id | card_type, status | Display player's available cards |
| `users` | GET /api/auth/me (if implemented) | email, theme_preference | Display user info, load theme |

---

### 8.3 Tables This Module Writes (via API)

| Table | Via Endpoint | Write Operation | When |
|---|---|---|---|
| `games` | POST /api/games/:id/move | Update board_state, current_turn | Player makes move |
| `game_cards` | POST /api/games/:id/use-card | Update status to 'used' | Player uses card |
| `moves` | POST /api/games/:id/move | Insert new move record | Player makes move (backend handles) |

---

### 8.4 Migration Considerations

None — Backend owns all schema migrations. Frontend only consumes API contracts.

---

## 9. API Documentation

### 9.1 Backend Service — Checkmate.Uno API

**Swagger URL:** [To be deployed]  
**Base URL:** `https://api.checkmate-uno.com`  
**Auth:** JWT Bearer token in Authorization header  

---

### 9.2 Critical Client-Side Behaviors

#### Move Validation Pre-Check
- Frontend uses chess.js library client-side to highlight legal moves BEFORE sending to backend
- This is UX optimization only — server is authoritative, server validation can still reject client-side "legal" moves if power card effects apply
- If server rejects move: show error toast, revert optimistic UI update

#### Optimistic Updates
- When user makes move: update board immediately (optimistic), send API request in parallel
- If API succeeds: state already correct
- If API fails: revert board to previous state, show error

#### Card Target Selection
- When card requires target (Shield, Freeze, Teleport, Wild Swap): enter "targeting mode"
- Targeting mode: dim non-targetable pieces, highlight valid targets based on card type
- Valid targets determined client-side using game rules (e.g., Shield only your own pieces)
- Server validates target again — if invalid, return error, card NOT consumed

---

## 10. Core Technical Flows

### Flow 1: Local 2-Player Game Start

**Trigger:** User clicks "Play Local" on homepage

**Steps:**
1. Frontend generates temporary game ID (UUID client-side, not persisted)
2. Frontend initializes game state in GameContext: `{mode: 'local', board_state: STARTING_FEN, current_turn: 'white', cards: [...8 random cards], active_effects: []}`
3. Frontend randomly assigns 3 cards to Player 1, 3 to Player 2, discards 2
4. Frontend navigates to `/game/:tempId`
5. Frontend renders board with starting position, shows Player 1 cards at bottom, Player 2 cards at top (both visible)
6. Frontend displays "White's Turn" indicator
7. User interaction: click piece → select destination → Frontend validates move using chess.js → Frontend updates GameContext → Frontend switches turn indicator → Device passed to other player
8. No API calls for local mode — all state in React Context, lost on page refresh

**Success Criteria:** Board rendered, pieces movable, turn indicator switches, cards usable, checkmate detected client-side

---

### Flow 2: Online Game Creation and Join

**Trigger:** User clicks "Create Room" in lobby

**Host Steps:**
1. Frontend calls `POST /api/games {mode: 'online'}` with JWT token
2. Backend returns `{game: {id, room_code: 'A3X9K2', status: 'waiting'}, cards: [...3 cards]}`
3. Frontend stores game in GameContext, navigates to `/game/:id`
4. Frontend renders "Waiting for opponent..." screen with room code prominently displayed
5. Frontend connects WebSocket: `socket.emit('join_room', {game_id: id})`
6. Frontend listens for `opponent_joined` event
7. When `opponent_joined` received: Frontend calls `GET /api/games/:id` to fetch full game state, renders board

**Guest Steps:**
1. Frontend shows "Join Room" modal, user enters room code
2. Frontend calls `POST /api/games/join {room_code: 'A3X9K2'}` with JWT token
3. Backend returns `{game: {id, status: 'in_progress'}, cards: [...3 cards]}`
4. Frontend stores game in GameContext, navigates to `/game/:id`
5. Frontend connects WebSocket: `socket.emit('join_room', {game_id: id})`
6. Frontend renders board with game state from API response

**Success Criteria:** Both players see identical board, both connected to WebSocket room, turn indicator shows "White's Turn"

---

### Flow 3: Execute Move with Real-Time Sync

**Trigger:** Player clicks piece → destination square

**Steps:**
1. Frontend validates move is player's turn (check `current_turn` in GameContext)
2. Frontend validates move is legal using chess.js client-side
3. Frontend applies optimistic update: move piece visually, animate movement
4. Frontend calls `POST /api/games/:id/move {from: 'e2', to: 'e4'}`
5. Backend validates move, updates database, emits WebSocket `move_made` event
6. Backend responds with `{board_state: new_fen, current_turn: 'black', is_check: false, is_checkmate: false}`
7. Frontend receives API response: updates GameContext with authoritative state (already matches optimistic update)
8. Frontend switches turn indicator to "Black's Turn"
9. Opponent's client receives `move_made` WebSocket event: `{from: 'e2', to: 'e4', new_board_state: new_fen, current_turn: 'black'}`
10. Opponent's frontend animates piece movement, updates GameContext, switches turn indicator

**Failure Handling:**
- If API returns 400 "Illegal move": Revert optimistic update (animate piece back to original square), show error toast
- If API returns 403 "Not your turn": Revert optimistic update, show error toast
- If WebSocket disconnects during move: Move still saved in backend database, opponent receives update on reconnect

**Success Criteria:** Both players see move within 500ms, both boards identical, turn indicator correct

---

### Flow 4: Power Card Activation with Target Selection

**Trigger:** Player clicks "Shield" card

**Steps:**
1. Frontend validates it's player's turn
2. Frontend enters "targeting mode": cursor changes to crosshair, non-targetable pieces dimmed
3. Frontend highlights valid targets (player's own pieces for Shield card)
4. User clicks their Knight at square "g1"
5. Frontend validates target is valid (piece belongs to player)
6. Frontend shows loading spinner on card
7. Frontend calls `POST /api/games/:id/use-card {card_id: 'card-uuid-1', target_data: {piece_square: 'g1'}}`
8. Backend validates card ownership, validates target, applies shield effect to `active_effects`
9. Backend responds with `{board_state: unchanged, active_effects: [{type: 'shield', pieceSquare: 'g1', turnsRemaining: 3}]}`
10. Frontend removes card from player's hand in GameContext
11. Frontend renders shield icon overlay on Knight at g1
12. If online mode: Backend emits `card_used` event to opponent
13. Opponent's client receives event: updates GameContext, renders opponent's card count decreased by 1, shows toast "Opponent used Shield"

**Edge Cases:**
- User clicks invalid target (opponent's piece for Shield): Frontend prevents selection via dimming, but if somehow sent to backend, API returns 400, frontend shows error toast, card NOT consumed
- User cancels targeting: Click "Cancel" button or press Escape → Exit targeting mode, card NOT consumed

**Success Criteria:** Card removed from hand, shield icon visible on piece, effect tracked in GameContext, opponent sees card count update

---

### Flow 5: Theme Switching

**Trigger:** User clicks settings icon → selects "Neon" theme

**Steps:**
1. Frontend updates ThemeContext: `{theme: 'neon'}`
2. Frontend triggers re-render of all theme-dependent components (board, cards, UI)
3. Frontend saves preference to localStorage: `localStorage.setItem('theme_preference', 'neon')`
4. If user is authenticated: Frontend calls `PATCH /api/users/me {theme_preference: 'neon'}` (async, fire-and-forget)
5. Backend updates `users.theme_preference` column (for cross-device sync)

**Page Load:**
1. Frontend checks localStorage for `theme_preference`
2. If found: load theme immediately (before API call)
3. If user is authenticated: call `GET /api/users/me`, compare localStorage to server value
4. If server value different: update localStorage to server value (server is source of truth)

**Success Criteria:** Theme changes instantly without page reload, preference persists across sessions

---

## 11. Module Relationships

### Hard Dependencies (Required)

| Dependency | Purpose | If Unavailable |
|---|---|---|
| Checkmate.Uno Backend API | All game logic, state persistence | App non-functional (no games can be created) |
| Socket.io Server | Real-time online multiplayer sync | Online mode non-functional (only local/computer work) |

### Soft Dependencies (Degraded Experience)

| Dependency | Purpose | If Unavailable |
|---|---|---|
| Supabase Auth | User authentication, theme sync | Online mode requires auth, local/computer still work anonymously |
| Browser LocalStorage | Theme persistence | Theme resets to default on every page load |

### Interdependencies

| Relationship | Nature | Example |
|---|---|---|
| Frontend ↔ Backend | Request-Response + Real-Time | Frontend calls REST API, Backend emits WebSocket events |
| Frontend ↔ LocalStorage | Read/Write | Theme preference stored locally for fast load |

---

## 12. External Integrations

### Integration 1: Checkmate.Uno Backend API

**Trigger:** Every game action (create, move, card use)  
**Protocol:** REST API (HTTPS)  
**Failure Behavior:** Show error toast, retry button, or disable UI until reconnect  
**Recovery:** Automatic retry with exponential backoff for network failures

---

### Integration 2: Socket.io WebSocket

**Trigger:** Online game start, continuous during online gameplay  
**Protocol:** WebSocket (wss://)  
**Failure Behavior:** Show "Disconnected" overlay, attempt auto-reconnect  
**Recovery:** Socket.io client auto-reconnects, frontend re-subscribes to game room on reconnect

---

## 13. Failure Points and Recovery

### Failure Mode 1: API Request Timeout

**Symptom:** Move button stuck in loading state, no response after 10 seconds  
**Cause:** Backend server overloaded or network latency  
**Recovery:** Frontend shows "Request timed out, try again" error, enables retry button  
**Prevention:** Set 10s timeout on all fetch requests

---

### Failure Mode 2: WebSocket Disconnection

**Symptom:** Opponent moves not appearing, "Disconnected" overlay shown  
**Cause:** Network instability, mobile browser backgrounding  
**Recovery:** Socket.io auto-reconnects, frontend re-emits `join_room` on reconnect, fetches latest game state from API  
**Prevention:** Use Socket.io built-in reconnection with exponential backoff

---

### Failure Mode 3: Optimistic Update Rejected

**Symptom:** Piece moves visually, then snaps back to original position  
**Cause:** Client-side validation passed but server-side validation failed (e.g., power card effect blocked move)  
**Recovery:** Revert optimistic update, show error toast with reason  
**Prevention:** Always validate server response before committing state

---

### Failure Mode 4: Theme Not Loading

**Symptom:** Board renders with default colors instead of user's saved theme  
**Cause:** LocalStorage cleared, API call failed  
**Recovery:** Use default theme (Light), allow user to manually re-select  
**Prevention:** Graceful fallback to default theme if localStorage read fails

---

### Failure Mode 5: Room Code Copy Fails

**Symptom:** User clicks "Copy Code" button, nothing happens  
**Cause:** Browser clipboard API permission denied or not supported  
**Recovery:** Show room code in selectable text field as fallback  
**Prevention:** Feature detection for clipboard API, fallback to text selection

---

### Failure Mode 6: Invalid Game ID in URL

**Symptom:** User navigates to `/game/invalid-uuid`, page shows loading spinner forever  
**Cause:** User manually edited URL or shared broken link  
**Recovery:** Frontend calls GET /api/games/:id, receives 404, shows "Game not found" error page with "Back to Home" button  
**Prevention:** Validate UUID format client-side before API call

---

### Failure Mode 7: Both Players Make Move Simultaneously

**Symptom:** Both players click move at same instant, one move rejected  
**Cause:** Network race condition  
**Recovery:** First move to reach server is accepted, second receives 403 "Not your turn", second player's move reverted  
**Prevention:** This is correct behavior — server is authoritative on turn order

---

### Failure Mode 8: Checkmate Not Displaying

**Symptom:** Checkmate occurs but winner modal doesn't appear  
**Cause:** Frontend didn't receive `game_over` event, or API response didn't include `is_checkmate: true`  
**Recovery:** Frontend polls GET /api/games/:id every 5 seconds as fallback, detects `status: 'completed'`, shows modal  
**Prevention:** Always check game status on every API response

---

### Failure Mode 9: Card Targeting Mode Stuck

**Symptom:** User activated card, targeting mode enabled, but cannot cancel or select target  
**Cause:** JavaScript error in targeting logic  
**Recovery:** Escape key listener always exits targeting mode, "Cancel" button always visible  
**Prevention:** Comprehensive error boundary around card component

---

## 14. Coding Standards

### 14.1 Naming Conventions

- Components: PascalCase (`GameBoard.tsx`, `PowerCard.tsx`)
- Hooks: camelCase with "use" prefix (`useGameState.ts`, `useWebSocket.ts`)
- Utility functions: camelCase (`validateMove.ts`, `generateRoomCode.ts`)
- CSS classes: kebab-case (`chess-board`, `power-card`, `turn-indicator`)
- API functions: camelCase (`fetchGame`, `executeMove`, `useCard`)

---

### 14.2 File Organization

```
src/
├── app/ (Next.js App Router)
│   ├── page.tsx
│   ├── lobby/
│   ├── game/
│   └── auth/
├── components/
│   ├── GameBoard/
│   │   ├── GameBoard.tsx
│   │   ├── Square.tsx
│   │   └── Piece.tsx
│   ├── PowerCards/
│   │   ├── CardHand.tsx
│   │   ├── PowerCard.tsx
│   │   └── CardTargeting.tsx
│   ├── UI/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── Toast.tsx
│   └── Layout/
│       ├── Header.tsx
│       └── ThemeSwitcher.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── GameContext.tsx
│   ├── ThemeContext.tsx
│   └── WebSocketContext.tsx
├── lib/
│   ├── api.ts (fetch wrappers)
│   ├── chess.ts (chess.js wrapper)
│   ├── socket.ts (Socket.io setup)
│   └── constants.ts (card types, themes, etc.)
├── hooks/
│   ├── useGameState.ts
│   ├── useWebSocket.ts
│   └── useAuth.ts
└── types/
    ├── game.ts
    ├── card.ts
    └── user.ts
```

---

### 14.3 Component Patterns

- **Functional Components Only:** No class components
- **TypeScript:** All components strongly typed, props interfaces exported
- **Hooks:** Use custom hooks for shared logic (useGameState, useWebSocket)
- **Context:** Use Context API for global state, avoid prop drilling
- **Error Boundaries:** Wrap each major section (board, cards, lobby) in error boundary
- **Loading States:** Always show loading spinner during API calls
- **Accessibility:** All buttons keyboard-navigable, board squares have aria-labels

---

### 14.4 Testing Requirements

- **Unit Tests:** All utility functions (move validation, card targeting logic)
- **Component Tests:** GameBoard, PowerCard, Modal components
- **Integration Tests:** Full game flow (create → move → checkmate)
- **E2E Tests:** Online multiplayer flow (create room → join → play)
- **Coverage Target:** 70% code coverage minimum

---

## 15. Constraints and Technical Limits

### Performance Constraints

| Constraint | Limit | Why |
|---|---|---|
| Board re-render time | <16ms (60 FPS) | Smooth animations during piece movement |
| API response timeout | 10 seconds | Prevent infinite loading states |
| WebSocket reconnect attempts | 5 attempts | Balance UX vs server load |
| LocalStorage size | <5MB | Browser limit, unlikely to hit with current data |

### Platform Constraints

| Constraint | Limit | Why |
|---|---|---|
| Minimum screen width | 375px | iPhone SE size, smallest modern mobile |
| Maximum board size | 80vw on mobile, 600px on desktop | Ergonomics |
| Touch target size | 44x44px minimum | iOS Human Interface Guidelines |
| Supported browsers | Chrome 90+, Safari 14+, Firefox 88+ | Modern browser APIs required |

---

## 16. Logs and Observability

### Client-Side Logging

**Events Logged:**
- Game created (mode, game_id)
- Move executed (from, to, success/failure)
- Card used (card_type, target, success/failure)
- API errors (endpoint, status_code, error_message)
- WebSocket connection/disconnection events
- Theme changed (old_theme, new_theme)

**Log Destination:** Browser console (dev mode), Sentry (production)

**PII Redaction:** Email addresses, JWT tokens never logged

---

### Error Tracking

**Tool:** Sentry (or similar)  
**Error Categories:**
- API request failures (network, 4xx, 5xx)
- WebSocket disconnections (unexpected)
- JavaScript runtime errors (uncaught exceptions)
- React render errors (caught by error boundaries)

**Alert Triggers:**
- Error rate >1% of sessions
- API timeout rate >5%
- WebSocket disconnect rate >10%

---

## 17. Security and Access Boundaries

### Authentication

- **Anonymous Access:** Local and Computer modes allow anonymous play (no JWT required)
- **Authenticated Access:** Online mode requires JWT token from backend (obtained via login/register)
- **Token Storage:** JWT stored in httpOnly cookie (managed by backend Set-Cookie header, not accessible to JavaScript)
- **Token Expiry:** 7 days (backend enforces), frontend redirects to login on 401 responses

### Authorization

- **Game Access:** Users can only access games they are participants in (enforced by backend, frontend hides unauthorized games)
- **Move Authorization:** Backend validates user is correct player for current turn (frontend enforces optimistically)

### Data Protection

- **Sensitive Data:** Passwords never stored client-side, always sent over HTTPS
- **XSS Prevention:** React's built-in escaping, no `dangerouslySetInnerHTML` used
- **CSRF Protection:** Not required (backend uses JWT tokens, not session cookies)

### Input Validation

- **Move Coordinates:** Validated against chess board bounds (a-h, 1-8)
- **Room Codes:** Validated format (6 alphanumeric uppercase)
- **Email:** Validated format (RFC 5322 regex)
- **Password:** Validated client-side (min 8 chars, 1 uppercase, 1 lowercase, 1 number), server validates again

---

## 18. Common Technical Misunderstandings

### Misunderstanding 1: "Frontend should validate moves to avoid unnecessary API calls"
**Reality:** Frontend validates for UX (show legal moves), but server is authoritative. Always send move to backend even if client validation passes. Power card effects may invalidate client-side validation.

### Misunderstanding 2: "Game state should persist in localStorage for offline play"
**Reality:** Game state must always sync with backend for online/computer modes. Only local mode is truly stateless (and intentionally lost on refresh). Persisting state client-side risks desync.

### Misunderstanding 3: "WebSocket is unnecessary, we can poll the API every second"
**Reality:** Polling creates 1 request/second per game (60 req/min), scales poorly. WebSocket uses 1 connection for entire game duration, server pushes updates only when needed. Essential for sub-500ms latency.

### Misunderstanding 4: "Optimistic updates are cheating prevention"
**Reality:** Optimistic updates are UX-only (instant feedback). They are ALWAYS reverted if server rejects. Server validation is the only cheat prevention.

### Misunderstanding 5: "Theme preference should only be in localStorage"
**Reality:** LocalStorage for immediate load, backend database for cross-device sync. If user changes theme on desktop, should persist on mobile. LocalStorage alone doesn't sync.

### Misunderstanding 6: "Card targeting should use HTML5 drag-and-drop API"
**Reality:** HTML5 drag-and-drop is buggy on mobile. Better to use click-to-activate card → click-to-target piece pattern. Works consistently across desktop and mobile.

---

## 19. Example Technical Scenarios

### Scenario 1: User Plays Shield Card on Knight, Opponent Attempts Capture

**Initial State:**
- User (White) has Knight at e4
- User has "Shield" card in hand
- Opponent (Black) has Bishop at d5

**User Actions:**
1. User clicks "Shield" card → Frontend enters targeting mode
2. User clicks Knight at e4 → Frontend calls `POST /api/games/:id/use-card {card_id, target_data: {piece_square: 'e4'}}`
3. Backend applies shield, responds with `{active_effects: [{type: 'shield', pieceSquare: 'e4', turnsRemaining: 3}]}`
4. Frontend removes "Shield" card from UI, displays shield icon on Knight

**Opponent Actions:**
1. Opponent's frontend receives `card_used` WebSocket event
2. Opponent sees opponent's card count decrease from 3 to 2
3. Opponent sees toast: "Opponent used Shield"
4. Opponent clicks Bishop → moves to e4 (attempting capture)
5. Frontend allows move (doesn't know about shield yet — only server knows)
6. Frontend calls `POST /api/games/:id/move {from: 'd5', to: 'e4'}`
7. Backend validates move, detects shield on e4, rejects move → returns 400 "This piece is shielded"
8. Opponent's frontend reverts optimistic update (Bishop snaps back to d5), shows error toast

**Final State:**
- Knight at e4 with shield icon (2 turns remaining)
- Bishop still at d5
- Turn remains Black's turn (move was rejected)

---

### Scenario 2: WebSocket Disconnection During Opponent's Turn

**Initial State:**
- Online game in progress
- User (White) just finished their move
- Turn is now Black's turn (opponent)

**Disconnection:**
1. User's internet connection drops (mobile data lost)
2. Socket.io client detects disconnection, fires `disconnect` event
3. Frontend shows "Connection lost, attempting to reconnect..." overlay
4. Socket.io client begins auto-reconnect attempts (every 1s, 2s, 4s, 8s, 16s)

**During Disconnection:**
1. Opponent (Black) makes their move
2. Backend saves move to database, emits `move_made` event to room
3. User's client is not connected, does not receive event

**Reconnection:**
1. User's internet returns, Socket.io reconnects within 5 seconds
2. Frontend receives `connect` event
3. Frontend calls `socket.emit('join_room', {game_id})`
4. Frontend calls `GET /api/games/:id` to fetch latest state
5. Backend returns current board state with opponent's move already applied
6. Frontend updates GameContext with fetched state, renders opponent's piece at new position (no animation, instant update)
7. Frontend hides "Connection lost" overlay

**Final State:**
- Board shows opponent's move (though user didn't see it happen in real-time)
- Turn indicator shows "White's Turn" (user's turn now)
- User can continue playing normally

---

### Scenario 3: Both Players Activate Extra Move Card in Same Game

**Initial State:**
- User (White) has "Extra Move" card
- Opponent (Black) has "Extra Move" card
- Current turn: White

**User Turn:**
1. User clicks "Extra Move" card → Frontend calls API
2. Backend sets flag in memory: `extra_move_granted = true` (not persisted, only for current turn)
3. User makes first move: e2 → e4 → Backend processes normally but does NOT switch turn
4. Frontend shows "Extra move available" indicator
5. User makes second move: d2 → d4 → Backend processes, NOW switches turn to Black
6. Backend clears `extra_move_granted` flag

**Opponent Turn:**
1. Opponent clicks "Extra Move" card → Same process
2. Opponent makes two moves in sequence
3. Turn switches back to White

**Key Technical Detail:**
- `extra_move_granted` flag is stored in backend request handler's memory (request-scoped variable), NOT in database
- This prevents bugs if game is interrupted between first and second move
- If user disconnects after first move, flag is lost, but game state is consistent (first move already saved)

---

## 20. Evolution Notes

### Decision 1: Why Next.js App Router over Pages Router

**Context:** Next.js 15 introduced App Router with Server Components, but Pages Router is more mature and widely documented.

**Decision:** Use App Router for this project.

**Rationale:**
- App Router is the future direction for Next.js, Pages Router will be deprecated eventually
- Server Components not heavily used in this app (mostly client-side game logic), but App Router still benefits from better code organization (app/ directory structure)
- Simpler nested layouts for auth pages vs game pages
- Learning investment pays off long-term

---

### Decision 2: Why Context API over Redux

**Context:** Redux is standard for state management in React apps, but adds significant boilerplate.

**Decision:** Use React Context API instead of Redux.

**Rationale:**
- App state is simple: game state (board, cards, turn), auth state (user, token), theme
- No complex async actions or middleware needed
- Context API sufficient for this scale (<10 state slices)
- Faster development, less code to maintain
- If app grows, can migrate to Zustand (lighter than Redux) later

---

### Decision 3: Why chess.js for Client-Side Validation

**Context:** Could validate moves using custom logic or server-only validation.

**Decision:** Use chess.js on both client and server.

**Rationale:**
- Client-side validation improves UX (instant feedback, highlight legal moves)
- chess.js is battle-tested library, handles all edge cases
- Server-side validation is still authoritative (client validation only for UX)
- Same library on both sides ensures consistency

**Trade-off:** Adds ~50KB to client bundle, but UX improvement worth it.

---

## 21. Review Triggers

| Trigger | Reviewer | Action |
|---|---|---|
| New screen or page added | Frontend Lead | Review routing, state management, accessibility |
| WebSocket event added/changed | Frontend + Backend Lead | Verify contract alignment, test real-time sync |
| API endpoint response changed | Frontend + Backend Lead | Update types, test error handling |
| Theme colors changed | Frontend Lead + Designer | Verify contrast ratios, test all themes |
| New power card type added | Frontend Lead | Implement card UI, targeting logic, effect rendering |
| Performance degradation (>50ms render time) | Frontend Lead | Profile React components, optimize re-renders |

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | May 16, 2026 | Frontend Team | Initial draft |
