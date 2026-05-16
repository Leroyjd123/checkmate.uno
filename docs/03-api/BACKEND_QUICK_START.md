# Backend Quick Start for Frontend Developer

**TL;DR:** Backend is running at `http://localhost:3000/api`. All endpoints require `Authorization: Bearer {token}` header except auth endpoints.

---

## Running the Backend

```bash
cd backend

# Install dependencies
npm install

# Set up environment (see SUPABASE_SETUP.md)
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

Server runs on `http://localhost:3000`

---

## Authentication

### Get a Token (For Testing)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Response:
{
  "accessToken": "eyJhbGc...",
  "userId": "uuid-here"
}
```

### Use Token in Requests

All subsequent API calls need this header:

```
Authorization: Bearer eyJhbGc...
```

In JavaScript:

```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/games', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ mode: 'online' })
});
```

---

## Core Flows

### 1. User Registration & Login

```typescript
// Register
POST /api/auth/register
{ "email": "user@example.com", "password": "SecurePass123" }
→ { accessToken, userId }

// Login
POST /api/auth/login
{ "email": "user@example.com", "password": "SecurePass123" }
→ { accessToken, userId }

// Store token
localStorage.setItem('token', accessToken);
```

### 2. Create & Join Game (Online)

```typescript
// Create game
POST /api/games
{ "mode": "online" }
→ { id, roomCode, boardState, yourCards }

// Share roomCode with opponent
// Opponent joins:
POST /api/games/join
{ "room_code": "ABC123" }
→ { id, boardState, opponentCardCount }

// Get game state
GET /api/games/{gameId}
→ { boardState, currentTurn, yourCards, opponentCardCount, activeEffects }
```

### 3. Make a Move

```typescript
// Execute move
POST /api/games/{gameId}/move
{ "from": "e2", "to": "e4" }
→ { success: true, boardState, currentTurn, isCheck, isCheckmate }

// Use a power card
POST /api/games/{gameId}/use-card
{ "card_id": "uuid-here" }
→ { success: true, activeEffects, boardState }
```

---

## Game State Structure

After `GET /api/games/{gameId}`, you receive:

```typescript
{
  id: string;              // Game UUID
  mode: "online" | "local" | "computer";
  status: "waiting" | "in_progress" | "completed" | "forfeited";
  boardState: string;      // FEN notation: "rnbqkbnr/pppppppp/8/..."
  currentTurn: "white" | "black";
  
  // Players (online only)
  hostId?: string;
  guestId?: string;
  
  // Your cards (array of card type strings)
  yourCards: ("skip_turn" | "reverse_move" | "extra_move" | 
              "teleport" | "shield" | "sacrifice" | "wild_swap" | "freeze")[];
  
  // Opponent's card count (online only)
  opponentCardCount?: number;
  
  // Active card effects
  activeEffects: {
    type: string;         // Card type that created the effect
    pieceSquare?: string; // e.g., "e4" (for shield, freeze)
    turnsRemaining: number;
    appliedBy: string;    // User UUID
  }[];
  
  createdAt: string;
  updatedAt: string;
}
```

---

## FEN to Visual Board

The `boardState` is stored as FEN notation. To display on a chessboard UI:

```typescript
// Example FEN
const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// Use chess.js to parse (if available)
import { Chess } from 'chess.js';
const chess = new Chess(fen);
const board = chess.board(); // Returns 8x8 array of pieces

// Or manually parse FEN (ranks separated by /)
const ranks = fen.split(' ')[0].split('/');
ranks.forEach((rank, r) => {
  let file = 0;
  for (const char of rank) {
    if (/\d/.test(char)) {
      file += parseInt(char); // Empty squares
    } else {
      // Place piece (char = piece symbol)
      board[r][file++] = char;
    }
  }
});
```

---

## Card Effects & Turn Tracking

When a card is used, it's added to `activeEffects`:

```typescript
{
  "type": "skip_turn",           // The card that was used
  "pieceSquare": null,           // null for skip_turn, "e4" for freeze/shield
  "turnsRemaining": 1,           // Decrement each turn
  "appliedBy": "opponent-uuid"   // Who applied it
}
```

**Effect Handling by Card Type:**

| Card | Target | Effect | Duration |
|------|--------|--------|----------|
| skip_turn | N/A | Skip opponent's next turn | 1 turn |
| reverse_move | N/A | Undo opponent's last move | Immediate |
| extra_move | N/A | You get 2 moves this turn | 1 turn |
| teleport | Empty square | Move piece anywhere | Immediate |
| shield | Piece (e.g., "e2") | Block opponent capture | 1 turn |
| sacrifice | N/A | Remove both queens | Immediate |
| wild_swap | 2 pieces | Swap two pieces | Immediate |
| freeze | Piece (e.g., "e2") | Prevent piece movement | 1 turn |

---

## API Base URL

For all requests, use:

```
http://localhost:3000/api
```

For production, it will be:

```
https://checkmate-uno-api.example.com/api
```

---

## Error Handling

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Illegal move: e2 to e5",
  "error": "Bad Request"
}
```

Common errors:

```typescript
if (response.statusCode === 401) {
  // Token expired or missing
  // Redirect to login
}

if (response.statusCode === 400) {
  // Invalid request (bad move, not your turn, etc.)
  // Show user error message
}

if (response.statusCode === 403) {
  // Not authorized to access this game
}

if (response.statusCode === 404) {
  // Game not found
}
```

---

## What's NOT Ready Yet

These endpoints return `400 Bad Request` (stubs only):

- ❌ `POST /api/games/join` - Join by room code
- ❌ `POST /api/games/:id/move` - Execute move
- ❌ `POST /api/games/:id/use-card` - Use power card
- ❌ `GET /api/users/me` - Get user profile
- ❌ `PATCH /api/users/me` - Update profile
- ❌ WebSocket events - Real-time sync

These are coming in the next phase of backend implementation.

---

## Testing Against Local Backend

**Option 1: Manual cURL**

```bash
# Create game
curl -X POST http://localhost:3000/api/games \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"mode":"online"}'
```

**Option 2: Postman/Insomnia**

Import the endpoints and set:
- `baseUrl`: `http://localhost:3000/api`
- Default header: `Authorization: Bearer {token}`

**Option 3: Frontend App**

Set your API client to:

```typescript
const API_BASE = 'http://localhost:3000/api';
```

---

## Database Inspection

View/edit data in Supabase directly:

```bash
# Or use Prisma Studio for local inspection
npx prisma studio
```

Opens interactive UI at `http://localhost:5555`

---

## File Structure Reference

```
backend/
├── src/
│   ├── auth/           # Auth module (login/register)
│   ├── games/          # Games module (create/join/move/cards)
│   ├── chess/          # Chess logic wrapper
│   ├── database/       # Prisma service
│   ├── common/         # Shared types
│   └── app.module.ts   # Root module
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migration history
└── package.json
```

---

## Next Steps

1. Frontend dev: Set up React/Next.js app
2. Create API client service (axios wrapper with auth)
3. Build login/register pages
4. Build game creation flow
5. Build chess board UI
6. Implement move/card logic once endpoints are ready

See `BACKEND_API_REFERENCE.md` for full endpoint documentation.
