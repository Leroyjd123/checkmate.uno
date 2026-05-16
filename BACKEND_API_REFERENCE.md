# Backend API Reference

**Last Updated:** 2026-05-16  
**Status:** Week 1 - Database & Auth Complete, Games Module Scaffolded

---

## Database Schema

### User
```prisma
model User {
  id                String   @id @default(uuid())
  email             String   @unique
  themePreference   String   @default("light")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  hostedGames       Game[]   @relation("hostId")
  guestGames        Game[]   @relation("guestId")
  wonGames          Game[]   @relation("winnerId")
  gameCards         GameCard[]
  moves             Move[]
}
```

### Game
```prisma
model Game {
  id              String   @id @default(uuid())
  mode            GameMode @default(online)  // local, computer, online
  roomCode        String?  @unique           // 6-char code for online games
  status          GameStatus @default(waiting)  // waiting, in_progress, completed, forfeited
  
  hostId          String?
  host            User?    @relation("hostId", fields: [hostId], references: [id])
  
  guestId         String?
  guest           User?    @relation("guestId", fields: [guestId], references: [id])
  
  currentTurn     TurnColor @default(white)  // white or black
  boardState      String   // FEN notation (e.g., "rnbqkbnr/pppppppp/...")
  activeEffects   Json     // Array of {type, pieceSquare, turnsRemaining, appliedBy}
  
  winnerId        String?
  winner          User?    @relation("winnerId", fields: [winnerId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  cards           GameCard[]
  moves           Move[]
}
```

### GameCard
```prisma
model GameCard {
  id        String   @id @default(uuid())
  gameId    String
  game      Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  playerId  String?  // null for unassigned cards or computer
  player    User?    @relation(fields: [playerId], references: [id], onDelete: SetNull)
  
  cardType  CardType // skip_turn, reverse_move, extra_move, teleport, shield, sacrifice, wild_swap, freeze
  status    CardStatus @default(available)  // available or used
  usedAt    DateTime?
}
```

### Move
```prisma
model Move {
  id            String   @id @default(uuid())
  gameId        String
  game          Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  playerId      String?
  player        User?    @relation(fields: [playerId], references: [id], onDelete: SetNull)
  
  moveNotation  String   // e.g., "e2e4"
  cardUsed      String?  // e.g., "shield"
  timestamp     DateTime @default(now())
}
```

### Enums
```typescript
GameMode: "local" | "computer" | "online"
GameStatus: "waiting" | "in_progress" | "completed" | "forfeited"
TurnColor: "white" | "black"
CardType: "skip_turn" | "reverse_move" | "extra_move" | "teleport" | "shield" | "sacrifice" | "wild_swap" | "freeze"
CardStatus: "available" | "used"
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "userId": "uuid-here"
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Min 8 chars, must include uppercase, lowercase, and number

---

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 604800,
  "userId": "uuid-here"
}
```

---

#### GET `/api/users/me`
**Status:** Not yet implemented (planned)

Get current authenticated user profile.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "themePreference": "light",
  "createdAt": "2026-05-16T10:00:00Z",
  "updatedAt": "2026-05-16T10:00:00Z"
}
```

---

#### PATCH `/api/users/me`
**Status:** Not yet implemented (planned)

Update user profile.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "themePreference": "dark"
}
```

**Response (200):**
```json
{
  "id": "uuid-here",
  "email": "user@example.com",
  "themePreference": "dark",
  "updatedAt": "2026-05-16T10:05:00Z"
}
```

---

### Games

#### POST `/api/games`
Create a new game.

**Headers:** `Authorization: Bearer {token}` (required for online mode)

**Request Body:**
```json
{
  "mode": "online"  // "local", "computer", or "online"
}
```

**Response (201):**
```json
{
  "id": "game-uuid",
  "mode": "online",
  "roomCode": "ABC123",
  "status": "waiting",
  "boardState": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "currentTurn": "white",
  "hostId": "user-uuid",
  "yourCards": ["skip_turn", "shield", "teleport"],  // 3 random cards
  "createdAt": "2026-05-16T10:00:00Z"
}
```

**Notes:**
- For "online" mode: requires auth, generates 6-char room code
- For "local" mode: no auth needed, immediate start
- For "computer" mode: no auth needed, plays against AI

---

#### GET `/api/games/:id`
Get game details and current state.

**Headers:** `Authorization: Bearer {token}` (required for online mode)

**Response (200):**
```json
{
  "id": "game-uuid",
  "mode": "online",
  "roomCode": "ABC123",
  "status": "in_progress",
  "boardState": "rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "currentTurn": "black",
  "hostId": "host-user-uuid",
  "guestId": "guest-user-uuid",
  "yourCards": ["skip_turn", "shield", "teleport"],
  "opponentCardCount": 3,  // Only for online mode
  "activeEffects": [],
  "createdAt": "2026-05-16T10:00:00Z",
  "updatedAt": "2026-05-16T10:05:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Game does not exist or access denied
- `403 Forbidden`: User is not a participant in online game

---

#### POST `/api/games/join`
**Status:** Not yet implemented (stub returns 400)

Join an online game by room code.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "room_code": "ABC123"
}
```

**Response (201):**
```json
{
  "id": "game-uuid",
  "mode": "online",
  "status": "in_progress",
  "boardState": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "currentTurn": "white",
  "hostId": "host-user-uuid",
  "guestId": "guest-user-uuid",
  "yourCards": ["reverse_move", "extra_move", "freeze"],
  "opponentCardCount": 3
}
```

---

#### POST `/api/games/:id/move`
**Status:** Not yet implemented (stub returns 400)

Execute a chess move.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "from": "e2",
  "to": "e4"
}
```

**Response (200):**
```json
{
  "success": true,
  "boardState": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
  "currentTurn": "black",
  "isCheckmate": false,
  "isCheck": false,
  "activeEffects": []
}
```

**Error Responses:**
- `400 Bad Request`: Illegal move
- `400 Bad Request`: Not your turn
- `400 Bad Request`: Game already completed

---

#### POST `/api/games/:id/use-card`
**Status:** Not yet implemented (stub returns 400)

Use a power card.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "card_id": "card-uuid",
  "target_data": {}  // Optional, depends on card type
}
```

**Card Type Examples:**
- `skip_turn`: Skip opponent's next turn
- `reverse_move`: Undo opponent's last move
- `extra_move`: Take an additional move
- `teleport`: Move piece to any empty square
- `shield`: Protect a piece from being captured
- `sacrifice`: Sacrifice your queen to remove opponent's queen
- `wild_swap`: Swap two pieces on the board
- `freeze`: Prevent opponent from moving a specific piece for 1 turn

**Response (200):**
```json
{
  "success": true,
  "cardUsed": "skip_turn",
  "activeEffects": [
    {
      "type": "skip_turn",
      "pieceSquare": null,
      "turnsRemaining": 1,
      "appliedBy": "user-uuid"
    }
  ],
  "boardState": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
}
```

---

## WebSocket Events

**Status:** Not yet implemented

**Connection:** `ws://localhost:3000/games/:gameId`

### Emit (Client → Server)
- `move_made` - Broadcast move to opponent
- `card_used` - Broadcast card effect
- `forfeit` - Surrender the game

### Listen (Server → Client)
- `opponent_joined` - Guest joined the online game
- `move_made` - Opponent made a move
- `card_used` - Opponent used a card
- `game_over` - Game ended (winner or forfeit)
- `active_effects_updated` - Card effects changed

---

## Authentication Flow

1. **Register** → `POST /api/auth/register` → Receive JWT token
2. **Store token** → Save in `localStorage` as `Authorization: Bearer {token}`
3. **All subsequent requests** → Include `Authorization` header
4. **Token expiry** → 7 days from issue
5. **Refresh** → Re-login when expired (no refresh token endpoint yet)

---

## Error Response Format

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Description of error",
  "error": "Bad Request"
}
```

**Common Status Codes:**
- `201`: Created
- `200`: Success
- `400`: Bad Request (validation, illegal move, etc.)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (not a participant)
- `404`: Not Found
- `500`: Server Error

---

## Next Steps (Implementation Order)

1. ✅ Auth module (register, login endpoints)
2. ✅ Database schema & Prisma ORM
3. ✅ ChessService wrapper (move validation)
4. ⏳ Games module:
   - POST `/api/games/:id/move` (execute move, validate chess, check effects)
   - POST `/api/games/:id/use-card` (apply card effects, update activeEffects JSONB)
   - POST `/api/games/join` (join online game by room code)
5. ⏳ WebSocket Gateway (real-time sync between players)
6. ⏳ Computer AI opponent (random moves, difficulty levels)

---

## Development Notes

- **Board State:** Stored as FEN notation for compatibility with chess.js
- **Active Effects:** JSONB array storing active power card effects with turn counters
- **Room Code:** 6-char alphanumeric, excludes 0/O/1/I to avoid confusion
- **Card Distribution:** 3 cards per player from shuffled pool of 8 unique cards
- **Server-Authoritative:** All moves validated by backend, no client-side cheating
- **Turn Color:** Tracked separately from chess.js turn to handle effects like skip_turn

---

## Frontend Integration Checklist

- [ ] Set up API client (axios/fetch wrapper with auth header)
- [ ] Implement login/register forms with validation
- [ ] Create game creation flow (mode selection)
- [ ] Implement room code joining for online mode
- [ ] Build chess board UI (FEN to visual board)
- [ ] Add move input (drag-drop or click-click)
- [ ] Implement card UI (hand, play button)
- [ ] Add WebSocket listener for real-time updates
- [ ] Build game over screen (winner display)
- [ ] Add loading states & error handling
