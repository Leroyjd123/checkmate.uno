# Checkmate.Uno — Backend Technical Requirements Document

## Document Metadata

**Module:** Checkmate.Uno Backend API  
**Service:** checkmate-uno-api (NestJS)  
**Document Type:** TRD  
**Version:** v1.0  
**Status:** Draft  
**Last Reviewed:** May 16, 2026  
**Primary Owner:** To be assigned  
**Secondary Owner:** To be assigned  
**Related Module:** Checkmate.Uno Frontend  
**Classification:** Internal

---

## 1. Module Overview

The Checkmate.Uno Backend API is a NestJS REST API with WebSocket support that handles all game logic, move validation, power card effects, and real-time synchronization for the chess variant game. It serves as the authoritative source of truth for game state, validates all moves server-side using chess.js, manages room-based matchmaking, and provides real-time updates via Socket.io.

The backend integrates with Supabase for database persistence and authentication, exposes REST endpoints for game CRUD operations, and maintains WebSocket connections for live game updates in online multiplayer mode.

**Quick Links:**
- API Documentation: [To be deployed — Swagger/Scalar URL]
- Database Diagram: [To be provided]
- Repository: [To be provided]
- Deployment: Railway/Render (free tier)

**Folder Structure:**
```
src/
├── main.ts
├── app.module.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── games/
│   ├── games.module.ts
│   ├── games.controller.ts
│   ├── games.service.ts
│   ├── games.gateway.ts (WebSocket)
│   ├── dto/
│   │   ├── create-game.dto.ts
│   │   ├── join-room.dto.ts
│   │   ├── make-move.dto.ts
│   │   └── use-card.dto.ts
│   └── entities/
│       ├── game.entity.ts
│       └── game-card.entity.ts
├── chess/
│   ├── chess.module.ts
│   └── chess.service.ts (wraps chess.js)
└── database/
    ├── prisma.module.ts
    └── prisma.service.ts
```

---

## 2. Technical Purpose and Design Decisions

### 2.1 Why This Module Exists

Checkmate.Uno Backend exists as a separate service to provide server-side authoritative validation for chess moves and power card effects, preventing client-side cheating. It ensures consistent game state across all clients in online multiplayer mode and serves as a centralized persistence layer for all game data.

**Architectural reason:** Client-side only validation would allow players to manipulate game state via browser dev tools. All game logic must run server-side with clients acting as dumb displays. The backend enforces chess rules, validates power card effects, and maintains the single source of truth for board state.

**Authentication Architecture Clarification:**
- Backend **proxies Supabase Auth** via `/api/auth/register` and `/api/auth/login` endpoints (does not implement auth from scratch)
- User submits credentials to backend → backend calls Supabase Auth API → backend returns JWT wrapped in httpOnly Set-Cookie header
- On authenticated routes, backend validates JWT tokens using NestJS JWT strategy
- Supabase handles password hashing, user storage, and auth validation; backend adds business logic layer

**Dependencies:**
- **Supabase Postgres:** Game state persistence
- **Supabase Auth:** User account creation, password validation, JWT generation
- **Socket.io:** Real-time bidirectional communication for online multiplayer
- **chess.js:** Chess move validation, FEN parsing, checkmate detection

**Interfaces with:**
- **Frontend (Next.js):** REST API for game CRUD + auth, WebSocket for real-time updates
- **Supabase Auth:** Backend proxies user signup/login, validates JWT tokens on protected routes

---

### 2.2 Core Responsibilities

The backend owns:
- Chess move validation (all standard rules except castling/en passant)
- Power card effect execution and validation
- Game state persistence and retrieval
- Room code generation and collision detection
- Check and checkmate detection
- Turn management and enforcement
- Real-time move broadcasting to connected clients
- Game result determination and storage

---

### 2.3 Design Decisions

**Decision 1: FEN Notation for Board State**
- **What:** Store board state as FEN string (e.g., `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`) instead of JSON piece positions
- **Why:** FEN is chess standard, compact (80 bytes vs 500+ bytes JSON), directly compatible with chess.js library, enables easy debugging with any chess tool
- **Alternative rejected:** JSON array of 64 squares — verbose, non-standard, requires custom parsing
- **When:** Decided during architecture phase
- **Impact:** All chess libraries work natively, smaller database storage

**Decision 2: Separate WebSocket Gateway from REST Controller**
- **What:** GamesGateway (Socket.io) handles real-time events, GamesController handles REST CRUD
- **Why:** Clean separation of concerns — REST for state changes, WebSocket for broadcasts. Easier to scale WebSocket separately in future. Allows local/computer modes to skip WebSocket entirely.
- **Alternative rejected:** Combined gateway handling both — creates tight coupling, harder to test
- **When:** Initial design
- **Impact:** Clear architecture, both transports can evolve independently

**Decision 3: Power Card Effects Stored as Metadata, Not DB Relations**
- **What:** Active shields/freezes stored in `games.active_effects` JSONB column as array of `{type, pieceSquare, turnsRemaining}`
- **Why:** Effects are ephemeral (max 3 turns), low cardinality (max 10 active effects per game), faster to query inline than JOINs. JSONB supports atomic updates.
- **Alternative rejected:** Separate `active_effects` table — over-normalized for temporary data, adds query complexity
- **When:** Database schema design
- **Impact:** Simpler queries, faster effect expiration checks, single-row updates

**Decision 4: No Server-Side Game Timer**
- **What:** No automatic turn timeout or game abandonment detection in MVP
- **Why:** Adds complexity (cron jobs, timezone handling, state cleanup), low priority for casual play, manual forfeit sufficient for MVP
- **Alternative rejected:** Scheduled job checking for >5min inactive games — premature optimization, creates support burden
- **When:** Scope definition
- **Impact:** Deferred to future iteration, simpler initial deployment

---

## 3. Data Ownership

### Tables Owned (Read and Write)

| Table | Purpose | Key Fields |
|---|---|---|
| `games` | Game state and metadata | id, mode, room_code, status, host_id, guest_id, current_turn, board_state (FEN), active_effects (JSONB), winner_id |
| `game_cards` | Player card hands | id, game_id, player_id, card_type, status (available/used) |
| `moves` | Move history (analytics only) | id, game_id, player_id, move_notation, card_used, timestamp |

### Tables Read But Not Written

| Table | Owner | Purpose |
|---|---|---|
| `users` | Supabase Auth | User authentication, theme preferences |

### Tables This Module Must Not Touch

| Table | Owner | Why |
|---|---|---|
| None | — | This module is self-contained |

---

### 3.2 What This Module Does NOT Handle

The backend explicitly does NOT:
- User registration or password reset (handled by Supabase Auth directly)
- Frontend theme rendering or preferences storage (stored in `users.theme_preference`, read by frontend only)
- Game replays or move export (moves table populated but not queried in MVP)
- Matchmaking or ELO rating (out of MVP scope)
- Payment or monetization (out of MVP scope)
- Admin panel or moderation tools (out of MVP scope)

**Rationale:** These concerns either belong in the frontend, are handled by Supabase Auth, or are deferred to post-MVP iterations to minimize initial complexity.

---

## 4. Data Models

### 4.1 Games Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | Unique game identifier |
| mode | ENUM('local', 'computer', 'online') | NOT NULL | Game mode |
| room_code | VARCHAR(6) | UNIQUE, NULLABLE | Room code for online games |
| status | ENUM('waiting', 'in_progress', 'completed', 'forfeited') | NOT NULL | Game status |
| host_id | UUID | FOREIGN KEY → users.id, NULLABLE | Host player (white) |
| guest_id | UUID | FOREIGN KEY → users.id, NULLABLE | Guest player (black) |
| current_turn | ENUM('white', 'black') | NOT NULL | Whose turn it is |
| board_state | TEXT | NOT NULL | FEN notation string |
| active_effects | JSONB | DEFAULT '[]' | Array of active power card effects |
| winner_id | UUID | FOREIGN KEY → users.id, NULLABLE | Winner user ID |
| created_at | TIMESTAMP | DEFAULT NOW() | Game creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes:**
- `room_code` (unique, for fast room lookups)
- `status` (for querying active games)
- `host_id`, `guest_id` (for user game history)

**Active Effects Schema:**
```json
[
  {
    "type": "shield",
    "pieceSquare": "e4",
    "turnsRemaining": 2,
    "appliedBy": "white"
  },
  {
    "type": "freeze",
    "pieceSquare": "d7",
    "turnsRemaining": 1,
    "appliedBy": "black"
  }
]
```

---

### 4.2 Game Cards Table

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | Unique card identifier |
| game_id | UUID | FOREIGN KEY → games.id | Parent game |
| player_id | UUID | FOREIGN KEY → users.id, NULLABLE | Card owner (null for computer) |
| card_type | ENUM('skip_turn', 'reverse_move', 'extra_move', 'teleport', 'shield', 'sacrifice', 'wild_swap', 'freeze') | NOT NULL | Power card type |
| status | ENUM('available', 'used') | NOT NULL | Card availability |
| used_at | TIMESTAMP | NULLABLE | When card was played |

**Indexes:**
- `game_id` (for fetching all cards in a game)
- Composite index on `(game_id, player_id, status)` (for fetching player's available cards)

---

### 4.3 Moves Table (Analytics Only)

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | UUID | Primary Key | Unique move identifier |
| game_id | UUID | FOREIGN KEY → games.id | Parent game |
| player_id | UUID | FOREIGN KEY → users.id, NULLABLE | Player who made move |
| move_notation | VARCHAR(10) | NOT NULL | Chess notation (e.g., "e2e4") |
| card_used | VARCHAR(20) | NULLABLE | Card type used this turn |
| timestamp | TIMESTAMP | DEFAULT NOW() | When move was made |

**Note:** This table is write-only in MVP — used for future analytics, not queried during gameplay.

---

### 4.4 State Machine

**Game Status State Machine:**

```
[User creates game]
       ↓
   WAITING (online mode only)
       ↓ [opponent joins]
   IN_PROGRESS
       ↓
       ├→ COMPLETED (checkmate detected)
       └→ FORFEITED (disconnect >60s)
```

**State Definitions:**
- **WAITING:** Online game created, waiting for second player to join via room code
- **IN_PROGRESS:** Game active, players taking turns
- **COMPLETED:** Game ended via checkmate, winner determined
- **FORFEITED:** Game ended due to player disconnect (online mode only)

**Valid Transitions:**
- WAITING → IN_PROGRESS (guest joins room)
- IN_PROGRESS → COMPLETED (checkmate detected)
- IN_PROGRESS → FORFEITED (player disconnect >60s)

**Terminal States:** COMPLETED, FORFEITED

---

## 5. API Contracts

### 5.1 Public REST Endpoints

#### POST /api/auth/register
**Purpose:** Create new user account  
**Authentication:** None  
**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123"
}
```
**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Errors:**
- 400: Invalid email format or password too weak
- 409: Email already exists

---

#### POST /api/auth/login
**Purpose:** Authenticate existing user  
**Authentication:** None  
**Request:**
```json
{
  "email": "player@example.com",
  "password": "SecurePass123"
}
```
**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "player@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Errors:**
- 401: Invalid email or password

---

#### POST /api/games
**Purpose:** Create new game  
**Authentication:** Optional (required for online mode)  
**Request:**
```json
{
  "mode": "online"
}
```
**Response (201):**
```json
{
  "game": {
    "id": "game-uuid",
    "mode": "online",
    "room_code": "A3X9K2",
    "status": "waiting",
    "host_id": "user-uuid",
    "board_state": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "current_turn": "white"
  },
  "cards": [
    {"id": "card-uuid-1", "type": "shield"},
    {"id": "card-uuid-2", "type": "teleport"},
    {"id": "card-uuid-3", "type": "extra_move"}
  ]
}
```
**Errors:**
- 401: Unauthorized (online mode requires auth)
- 409: User already has active waiting game

---

#### POST /api/games/join
**Purpose:** Join online game via room code  
**Authentication:** Required  
**Request:**
```json
{
  "room_code": "A3X9K2"
}
```
**Response (200):**
```json
{
  "game": {
    "id": "game-uuid",
    "mode": "online",
    "status": "in_progress",
    "host_id": "host-user-uuid",
    "guest_id": "guest-user-uuid",
    "board_state": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "current_turn": "white"
  },
  "cards": [
    {"id": "card-uuid-4", "type": "freeze"},
    {"id": "card-uuid-5", "type": "wild_swap"},
    {"id": "card-uuid-6", "type": "skip_turn"}
  ]
}
```
**Errors:**
- 401: Unauthorized
- 404: Room not found or already started
- 409: User already in this game

---

#### GET /api/games/:id
**Purpose:** Retrieve game state  
**Authentication:** Optional (required for online mode)  
**Response (200):**
```json
{
  "id": "game-uuid",
  "mode": "online",
  "status": "in_progress",
  "current_turn": "white",
  "board_state": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "active_effects": [
    {"type": "shield", "pieceSquare": "e4", "turnsRemaining": 2}
  ],
  "your_cards": [
    {"id": "card-uuid-1", "type": "shield", "status": "available"}
  ],
  "opponent_card_count": 2
}
```
**Errors:**
- 404: Game not found
- 403: User not participant in this game (online mode)

---

#### POST /api/games/:id/move
**Purpose:** Execute chess move  
**Authentication:** Optional (required for online mode)  
**Request:**
```json
{
  "from": "e2",
  "to": "e4"
}
```
**Response (200):**
```json
{
  "board_state": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "current_turn": "black",
  "is_check": false,
  "is_checkmate": false,
  "active_effects": []
}
```
**Errors:**
- 400: Illegal move
- 403: Not your turn
- 404: Game not found
- 409: Game not in progress

---

#### POST /api/games/:id/use-card
**Purpose:** Activate power card  
**Authentication:** Optional (required for online mode)  
**Request:**
```json
{
  "card_id": "card-uuid-1",
  "target_data": {
    "piece_square": "e4"
  }
}
```
**Response (200):**
```json
{
  "card_effect_applied": true,
  "board_state": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1",
  "active_effects": [
    {"type": "shield", "pieceSquare": "e4", "turnsRemaining": 3}
  ],
  "current_turn": "white"
}
```
**Errors:**
- 400: Invalid card target or effect cannot be applied
- 403: Not your turn or card not owned by you
- 404: Card not found or already used
- 409: Game not in progress

---

#### GET /api/users/me
**Purpose:** Retrieve authenticated user profile and preferences  
**Authentication:** Required  
**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "player@example.com",
  "theme_preference": "dark"
}
```
**Errors:**
- 401: Unauthorized (no JWT token)

---

#### PATCH /api/users/me
**Purpose:** Update user preferences (e.g., theme)  
**Authentication:** Required  
**Request:**
```json
{
  "theme_preference": "neon"
}
```
**Response (200):**
```json
{
  "id": "user-uuid",
  "email": "player@example.com",
  "theme_preference": "neon"
}
```
**Errors:**
- 400: Invalid theme preference
- 401: Unauthorized

---

### 5.2 WebSocket Events (Online Mode)

**Connection:** Client connects to `wss://api.checkmate-uno.com/games` with JWT token in query param

**Client → Server Events:**

| Event | Payload | Purpose |
|---|---|---|
| `join_room` | `{game_id: string}` | Subscribe to game updates |
| `leave_room` | `{game_id: string}` | Unsubscribe from game updates |

**Server → Client Events:**

| Event | Payload | Purpose |
|---|---|---|
| `opponent_joined` | `{game_id, opponent_id}` | Opponent joined waiting game |
| `move_made` | `{game_id, from, to, new_board_state, current_turn, is_check, is_checkmate}` | Opponent made move |
| `card_used` | `{game_id, card_type, target_data, new_board_state, active_effects}` | Opponent used power card |
| `game_over` | `{game_id, winner_id, reason}` | Game ended |
| `opponent_disconnected` | `{game_id}` | Opponent lost connection |
| `opponent_reconnected` | `{game_id}` | Opponent reconnected |

---

## 6. Core Technical Flows

### Flow 1: Create Online Game

**Trigger:** User clicks "Create Room" → Client calls `POST /api/games {mode: 'online'}`

1. GamesController receives request with authenticated user ID from JWT
2. GamesService checks if user already has a waiting game (query `games WHERE host_id = user_id AND status = 'waiting'`)
3. If existing waiting game found → return 409 Conflict
4. GamesService generates random 6-character room code (uppercase alphanumeric, excludes 0/O/1/I)
5. GamesService checks `games` table for code collision (WHERE `room_code = generated_code AND status IN ['waiting', 'in_progress']`)
6. If collision → retry generation (max 3 attempts), if all fail → return 500 error
7. GamesService generates 8 random power cards from pool of 8 types (array shuffle)
8. GamesService assigns first 3 cards to host (player 1), next 3 to guest slot (player 2), discards remaining 2
9. GamesService inserts game record: `{mode: 'online', room_code, status: 'waiting', host_id: user_id, current_turn: 'white', board_state: STARTING_FEN}`
10. GamesService inserts 6 records to `game_cards` table (3 for host, 3 for guest with null player_id)
11. GamesService returns game object + host's 3 cards to client
12. Client displays "Waiting for opponent" screen with room code

**Database writes:** 1 insert to `games`, 6 inserts to `game_cards`  
**WebSocket:** None (waiting state)  
**Failure modes:** Room code collision (max 3 retries), database write failure (rollback transaction)

---

### Flow 2: Join Online Game

**Trigger:** User enters room code, clicks "Join" → Client calls `POST /api/games/join {room_code}`

1. GamesController receives request with authenticated user ID
2. GamesService queries `games WHERE room_code = :code AND status = 'waiting'`
3. If no result → return 404 "Room not found or game already started"
4. If result found → verify user is not already host (`host_id != user_id`)
5. GamesService updates game: `SET guest_id = user_id, status = 'in_progress', updated_at = NOW()`
6. GamesService updates `game_cards`: assign 3 guest cards to joining user (`SET player_id = user_id WHERE game_id = :id AND player_id IS NULL LIMIT 3`)
7. GamesService retrieves full game state + guest's cards
8. GamesGateway emits `opponent_joined` event to host's WebSocket connection
9. GamesService returns game object + guest's 3 cards to client
10. Both clients initialize board and connect to game room via WebSocket

**Database writes:** 1 update to `games`, 3 updates to `game_cards`  
**WebSocket:** `opponent_joined` emitted to host  
**Failure modes:** Room code not found, user already in game, database update failure

---

### Flow 3: Execute Chess Move

**Trigger:** Player clicks piece → destination → Client calls `POST /api/games/:id/move {from: 'e2', to: 'e4'}`

1. GamesController receives request with authenticated user ID (if online mode)
2. GamesService queries game by ID, verifies status = 'in_progress'
3. GamesService verifies it's requester's turn: if `current_turn = 'white'`, requester must be `host_id`; if `current_turn = 'black'`, requester must be `guest_id`
4. If not requester's turn → return 403 "Not your turn"
5. GamesService loads `board_state` FEN string and `active_effects` JSONB
6. ChessService validates move using chess.js: `chess.move({from, to})`
7. If illegal move (invalid for piece type, blocked by other piece) → return 400 "Illegal move"
8. GamesService checks `active_effects` for freeze on source piece: if frozen, block move → return 400 "Piece is frozen"
9. If move is capture, check `active_effects` for shield on target piece: if shielded, block capture → return 400 "Piece is shielded"
10. If move is valid, ChessService updates internal board state, exports new FEN
11. ChessService checks for check: `chess.inCheck()`
12. ChessService checks for checkmate: `chess.isCheckmate()`
13. GamesService decrements `turnsRemaining` for all active effects where `appliedBy != current_turn`, removes effects with 0 turns
14. GamesService switches `current_turn`: white → black or black → white
15. If checkmate detected: update `status = 'completed'`, set `winner_id`, skip turn switch
16. GamesService saves updated game: `UPDATE games SET board_state = new_fen, current_turn = new_turn, active_effects = updated_effects, status = new_status`
17. GamesService inserts move record: `INSERT INTO moves (game_id, player_id, move_notation, timestamp)`
18. If online mode: GamesGateway emits `move_made` event to both players in room
19. If checkmate: GamesGateway emits `game_over` event with winner_id
20. GamesService returns new board state, turn, check status, checkmate status to client
21. Client updates UI: animates piece movement, updates turn indicator, shows checkmate modal if applicable

**Database writes:** 1 update to `games`, 1 insert to `moves`  
**WebSocket:** `move_made` event (online mode), optionally `game_over` event  
**Failure modes:** Illegal move, not player's turn, frozen/shielded piece, database write failure

---

### Flow 4: Use Power Card (Shield Example)

**Trigger:** Player clicks "Shield" card, selects their Knight → Client calls `POST /api/games/:id/use-card {card_id, target_data: {piece_square: 'g1'}}`

1. GamesController receives request with authenticated user ID
2. GamesService queries game, verifies status = 'in_progress'
3. GamesService verifies it's requester's turn (same logic as Flow 3 step 3)
4. GamesService queries `game_cards WHERE id = card_id AND player_id = user_id AND status = 'available'`
5. If card not found or already used → return 404 "Card not found or already used"
6. GamesService retrieves card type (e.g., 'shield')
7. GamesService validates target based on card type:
   - Shield: target must be player's own piece (verify piece color matches current_turn)
   - Freeze: target must be opponent's piece
   - Teleport: target square must be empty or valid capture
   - Wild Swap: both targets must contain pieces
8. If invalid target → return 400 "Invalid card target"
9. GamesService applies card effect:
   - Shield: append to `active_effects`: `{type: 'shield', pieceSquare: 'g1', turnsRemaining: 3, appliedBy: 'white'}`
   - Freeze: append to `active_effects`: `{type: 'freeze', pieceSquare: 'd7', turnsRemaining: 2, appliedBy: 'white'}`
   - Teleport/Wild Swap: modify `board_state` FEN directly via chess.js
   - Reverse Move: retrieve last move from `moves` table, undo via chess.js
   - Extra Move: set temporary flag `extra_move_granted = true` (stored in memory, not persisted)
   - Skip Turn: append to `active_effects`: `{type: 'skip_next_turn', appliedBy: 'white', turnsRemaining: 1}`
   - Sacrifice: modify FEN to remove opponent's pawn
10. GamesService updates `game_cards`: `SET status = 'used', used_at = NOW() WHERE id = card_id`
11. GamesService saves game: `UPDATE games SET board_state = new_fen, active_effects = updated_effects`
12. If online mode: GamesGateway emits `card_used` event to both players
13. GamesService returns new board state + active effects to client
14. Client removes card from player's hand, updates board visually, shows effect icon on piece if applicable

**Database writes:** 1 update to `game_cards`, 1 update to `games`  
**WebSocket:** `card_used` event (online mode)  
**Failure modes:** Card not found, invalid target, card effect creates illegal board state (e.g., Teleport king into check)

**Note:** Power card usage does NOT switch turn — player still makes their chess move after playing card.

---

### Flow 5: Computer Move Generation (VS Computer Mode)

**Trigger:** User completes their move → System schedules computer move (setTimeout 500ms for UX feel)

1. GamesService detects current_turn switched to 'black' (computer's color)
2. GamesService retrieves computer's available cards: `SELECT * FROM game_cards WHERE game_id = :id AND player_id IS NULL AND status = 'available'`
3. GamesService generates random number 0-100, if < 20 (20% chance): select random available card
4. If card selected: GamesService determines valid targets for card type
   - Shield: select random computer piece
   - Freeze: select random player piece
   - Teleport: select random empty square
   - Wild Swap: select 2 random pieces
5. If valid target exists: execute card usage (same logic as Flow 4)
6. ChessService loads current board state, generates all legal moves using chess.js `chess.moves({verbose: true})`
7. GamesService selects random move from legal moves array
8. GamesService executes move (same logic as Flow 3 steps 6-16)
9. If online mode: GamesGateway emits `move_made` event to player
10. Turn switches back to player
11. Client updates board and turn indicator

**Database writes:** 0-2 updates (card use + move)  
**WebSocket:** `move_made` event (if applicable)  
**Failure modes:** No legal moves available (stalemate, not detected in MVP — treat as game over)

---

## 7. Operations

### 7.1 Deployment

**Environment:** Railway/Render free tier  
**Build Command:** `npm run build`  
**Start Command:** `npm run start:prod`  
**Environment Variables:**
- `DATABASE_URL` — Supabase Postgres connection string
- `JWT_SECRET` — Secret for signing JWT tokens
- `SUPABASE_URL` — Supabase project URL
- `SUPABASE_ANON_KEY` — Supabase anonymous API key
- `PORT` — Server port (default 3000)

**Deployment Trigger:** Push to `main` branch → Auto-deploy via Railway/Render Git integration

---

### 7.2 Scheduled Jobs

None in MVP — no game cleanup, no timeout enforcement.

---

### 7.3 Idempotency

**Idempotent Operations:**
- GET /api/games/:id — Safe to call multiple times
- POST /api/games/:id/move with identical move — Second call returns 400 "Not your turn" (turn already switched)
- POST /api/games/:id/use-card with same card_id — Second call returns 404 "Card already used"

**Non-Idempotent Operations:**
- POST /api/games — Creates new game each time (by design)
- POST /api/games/join — First call succeeds, subsequent calls return 409 "Already in game"

**Enforcement Method:**
- Database constraints (unique room_codes, unique card IDs)
- Status checks in service layer before state mutations

---

## 8. Common Technical Misunderstandings

### Misunderstanding 1: "FEN notation is too complex, we should use JSON positions"
**Reality:** FEN is the chess standard, compact, and directly compatible with chess.js. Any custom format requires custom parsing and breaks interoperability with chess tools. FEN is the correct choice.

### Misunderstanding 2: "WebSocket connections should handle both moves and state queries"
**Reality:** REST for CRUD (get game state, create game) and WebSocket for broadcasts (move updates) is the correct separation. Mixing them creates complex client state management and harder debugging.

### Misunderstanding 3: "Card effects should be validated client-side for speed"
**Reality:** Server-side validation is mandatory to prevent cheating. Client-side validation is for UX only (show legal targets). Server is authoritative.

### Misunderstanding 4: "Active effects should be stored in a separate table"
**Reality:** Effects are short-lived (max 3 turns), low cardinality, and always queried with game state. JSONB column is faster and simpler than JOIN queries.

### Misunderstanding 5: "We need a game cleanup job to delete old games"
**Reality:** Not in MVP. Storage is cheap (Supabase free tier = 500MB), old games provide analytics value. Cleanup can be added later if storage becomes an issue.

### Misunderstanding 6: "Computer AI should use Stockfish or a real engine"
**Reality:** Random legal move generation is sufficient for MVP and keeps backend lightweight. Real AI adds complexity (engine integration, difficulty tuning) without MVP value. Players expect unpredictability from power cards, not chess mastery from the computer.

---

## 9. Failure Modes and Troubleshooting

### Failure Mode 1: WebSocket Disconnection

**Symptom:** Player reports "opponent moves not showing up" or "waiting for reconnection" message stuck on screen  
**Cause:** Network instability, server restart, or client tab backgrounded on mobile  
**Fix:** Client auto-reconnects on disconnect, re-subscribes to game room. Server maintains game state in database, no data loss.  
**Where to look:** WebSocket connection logs, `GamesGateway` connection handlers, client Socket.io reconnection config

---

### Failure Mode 2: Illegal Move Accepted

**Symptom:** Board shows invalid piece position (e.g., bishop moved straight)  
**Cause:** Server-side validation bug in chess.js wrapper or active effects not properly checked  
**Fix:** Debug `ChessService.validateMove()` method, verify `active_effects` filter logic for shields/freezes, check chess.js library version  
**Where to look:** `chess.service.ts`, `games.service.ts` move validation section, active_effects JSONB column in database

---

### Failure Mode 3: Room Code Collision

**Symptom:** User cannot create room, gets "Unable to create room, try again" error  
**Cause:** 3 consecutive room code generation attempts all collided with existing codes  
**Fix:** Extremely rare (probability < 0.001% with 6-char alphanumeric). If happens frequently, increase code length to 8 characters or add timestamp suffix.  
**Where to look:** `GamesService.generateRoomCode()` method, `games` table WHERE `room_code` query

---

### Failure Mode 4: Card Effect Not Applied

**Symptom:** Player uses card, card disappears, but effect doesn't show on board (e.g., shield icon missing)  
**Cause:** Card effect applied to `active_effects` JSONB but frontend not parsing correctly, or WebSocket event dropped  
**Fix:** Verify `active_effects` column in database has correct structure, check WebSocket `card_used` event payload, verify frontend effect rendering logic  
**Where to look:** `games.active_effects` JSONB column, `GamesGateway.emitCardUsed()`, frontend effect icon components

---

### Failure Mode 5: Checkmate Not Detected

**Symptom:** Game continues after checkmate position reached  
**Cause:** chess.js `isCheckmate()` not called after move, or active effects (shields) preventing valid checkmate detection  
**Fix:** Ensure `chess.isCheckmate()` runs after every move execution, verify shields don't block checkmate detection logic  
**Where to look:** `ChessService` move execution flow, checkmate detection logic, shield effect implementation

---

### Failure Mode 6: Turn Stuck on One Player

**Symptom:** Turn indicator never switches, one player cannot move  
**Cause:** `current_turn` not updated in database after move, or Skip Turn card effect not properly expired  
**Fix:** Verify `UPDATE games SET current_turn = :newTurn` executes in move flow, check `active_effects` for stuck skip_next_turn effects  
**Where to look:** `GamesService.executeMove()` turn switch logic, `active_effects` expiration logic

---

### Failure Mode 7: Database Connection Pool Exhausted

**Symptom:** API returns 500 errors, logs show "connection pool exhausted"  
**Cause:** Too many concurrent games, connections not released after queries  
**Fix:** Verify Prisma client connection pooling config, check for query leaks (unclosed transactions), upgrade to paid Supabase tier if free tier connection limit reached  
**Where to look:** Prisma client configuration, Supabase connection pool settings, database connection count metrics

---

## 10. Technical Standards

### 10.1 Error Handling
- All controller methods wrapped in try-catch
- Return structured error responses: `{error: string, message: string, statusCode: number}`
- Log all 500 errors with stack traces
- Client-friendly error messages (no database errors exposed)

### 10.2 Validation
- Use class-validator decorators on all DTOs
- Validate JWT tokens on all authenticated routes using JwtAuthGuard
- Validate chess moves server-side using chess.js (never trust client)
- Validate power card targets based on card type and game rules

### 10.3 Database Access
- Use Prisma ORM for all queries (never raw SQL)
- Wrap multi-step operations in transactions
- Use indexes for frequently queried fields (room_code, status, player IDs)
- Never expose user passwords or JWT secrets in logs

### 10.4 WebSocket Management
- Use Socket.io rooms scoped per game ID
- Disconnect idle connections after 10 minutes
- Handle reconnection gracefully (restore room subscription)
- Emit events to rooms, not individual socket IDs (prevents missed messages)

---

## 11. Review Triggers

| Trigger | Who | Frequency |
|---|---|---|
| New API endpoint added | Backend Lead | Per PR |
| Database schema change | Backend Lead + DB Admin | Per migration |
| Power card effect logic change | Backend Lead | Per PR |
| WebSocket event added/changed | Backend Lead + Frontend Lead | Per PR |
| Performance degradation (>500ms API response) | Backend Lead | When detected |
| Security vulnerability reported | Backend Lead + Security Team | Immediately |

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | May 16, 2026 | Backend Team | Initial draft |
