# Frontend Development Guide

**Status:** Foundation Complete | Build Verified ✅ | Dev Server Running

**Ports:**
- Frontend: `http://localhost:3001` (or auto-selected if 3000 is in use)
- Backend: `http://localhost:3000/api`
- WebSocket: `ws://localhost:3000`

---

## Current Project Structure

```
frontend/src/
├── app/                          # Next.js pages (App Router)
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage
│   ├── auth/
│   │   ├── login/page.tsx       # Login page
│   │   └── register/page.tsx    # Register page
│   ├── lobby/page.tsx           # Game lobby (create/join)
│   └── game/
│       ├── [gameId]/page.tsx    # Online game
│       ├── local/page.tsx       # Local game
│       └── computer/page.tsx    # Computer AI game
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # User auth & JWT
│   ├── GameContext.tsx          # Game state & reducer
│   ├── ThemeContext.tsx         # Light/Dark/Neon themes
│   └── WebSocketContext.tsx     # Socket.io wrapper
├── lib/                          # Utilities & helpers
│   ├── api.ts                   # Fetch wrapper with auth
│   ├── socket.ts                # Socket.io client
│   ├── chess.ts                 # chess.js wrapper
│   └── constants.ts             # Cards, colors, config
└── types/
    └── game.ts                   # TypeScript interfaces
```

---

## Running the Frontend

### Development Mode
```bash
cd frontend
npm run dev
# Opens at http://localhost:3001 (or available port)
# Auto-reloads on file changes
```

### Production Build
```bash
npm run build
npm run start
```

### Run Tests
```bash
npm test              # Jest tests
npm test:watch       # Watch mode
```

---

## Context Providers

The app uses **React Context API** for state management:

### 1. AuthContext
**Manages:** User login/registration, JWT tokens, protected routes

```typescript
// Get auth state anywhere in the app
const { user, token, login, register, logout, isLoading } = useAuth();

// Example: Login
const { user, token } = await login('user@example.com', 'password123');
localStorage.setItem('token', token);
```

**Key Methods:**
- `login(email, password)` → Returns `{ user, token }`
- `register(email, password)` → Same
- `logout()` → Clears token
- `isAuthenticated` → Boolean

### 2. GameContext
**Manages:** Game state, moves, cards, active effects

```typescript
const { game, cards, activeEffects, makeMove, useCard, setGame } = useGame();

// Example: Make a move
await makeMove('e2', 'e4');

// Example: Use a card
await useCard(cardId);
```

**Game State Structure:**
```typescript
{
  id: string;
  mode: 'local' | 'computer' | 'online';
  boardState: string;        // FEN
  currentTurn: 'white' | 'black';
  status: 'waiting' | 'in_progress' | 'completed';
  yourCards: Card[];
  activeEffects: Effect[];
}
```

### 3. ThemeContext
**Manages:** Light/Dark/Neon theme switching

```typescript
const { theme, setTheme } = useTheme();

// Change theme
setTheme('dark');  // 'light' | 'dark' | 'neon'

// Current theme CSS available as Tailwind classes
```

### 4. WebSocketContext
**Manages:** Socket.io connection and real-time events

```typescript
const { socket, connected, on, emit } = useWebSocket();

// Listen for opponent move
on('move_made', (data) => {
  updateBoard(data.boardState);
});

// Emit your move
emit('move_made', { gameId, userId, from, to, boardState });
```

---

## Key Files Breakdown

### `src/lib/api.ts` - API Client

All REST endpoints with auth header injection:

```typescript
import { apiCall } from '@/lib/api';

// Login
const { accessToken } = await apiCall('/auth/login', {
  method: 'POST',
  body: { email, password }
});

// Create game
const game = await apiCall('/games', {
  method: 'POST',
  body: { mode: 'online' }
});

// Make move
const result = await apiCall(`/games/${gameId}/move`, {
  method: 'POST',
  body: { from: 'e2', to: 'e4' }
});

// Use card
const result = await apiCall(`/games/${gameId}/use-card`, {
  method: 'POST',
  body: { card_id: cardId }
});
```

**Features:**
- Auto-injects `Authorization: Bearer {token}` header
- Timeout handling (5 second default)
- JSON parsing
- Error handling

### `src/lib/chess.ts` - Chess Wrapper

Wrapper around chess.js library:

```typescript
import { getChess, isLegalMove, getMoves, isCheckmate } from '@/lib/chess';

// Create chess instance from FEN
const chess = getChess(fenString);

// Check if move is legal
if (isLegalMove(chess, 'e2', 'e4')) {
  // Valid move
}

// Get all legal moves
const moves = getMoves(chess);  // Returns SAN notation: ['e4', 'e3', ...]

// Check game state
if (isCheckmate(chess)) {
  endGame();
}
```

### `src/lib/constants.ts` - Configuration

Card definitions, colors, API URL:

```typescript
export const CARDS = {
  skip_turn: { name: 'Skip Turn', color: 'red' },
  shield: { name: 'Shield', color: 'blue' },
  // ... 8 cards total
};

export const API_BASE = 'http://localhost:3000/api';
export const SOCKET_URL = 'http://localhost:3000';
```

---

## Common Tasks

### Task 1: Add a New Page

```typescript
// frontend/src/app/stats/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function StatsPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Game Stats for {user?.email}</h1>
      {/* Stats content */}
    </div>
  );
}
```

### Task 2: Create a New Component

```typescript
// frontend/src/components/GameBoard.tsx
'use client';

import { useGame } from '@/contexts/GameContext';

export function GameBoard() {
  const { game } = useGame();

  return (
    <div className="board">
      {/* Render 8x8 chess board from FEN */}
    </div>
  );
}
```

### Task 3: Make API Call with Auth

```typescript
'use client';

import { apiCall } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function MyComponent() {
  const { token } = useAuth();

  async function fetchData() {
    try {
      const data = await apiCall('/games', {
        method: 'GET'
      });
      console.log(data);
    } catch (error) {
      console.error('API error:', error);
    }
  }

  return <button onClick={fetchData}>Load Games</button>;
}
```

### Task 4: Handle WebSocket Events

```typescript
'use client';

import { useWebSocket } from '@/contexts/WebSocketContext';
import { useGame } from '@/contexts/GameContext';

export function GameSync() {
  const { socket } = useWebSocket();
  const { setGame } = useGame();

  useEffect(() => {
    // Subscribe to game
    socket.emit('subscribe_game', { gameId, userId });

    // Listen for opponent moves
    socket.on('move_made', (data) => {
      setGame(prev => ({
        ...prev,
        boardState: data.boardState,
        currentTurn: data.currentTurn
      }));
    });

    return () => socket.off('move_made');
  }, [gameId, socket, setGame]);

  return <div>Game Synced</div>;
}
```

---

## Building the Chess Board

### From FEN to Visual Board

```typescript
function fenToBoard(fen: string): string[][] {
  const ranks = fen.split(' ')[0].split('/');
  const board: string[][] = [];

  ranks.forEach((rank) => {
    const row: string[] = [];
    for (const char of rank) {
      if (/\d/.test(char)) {
        // Empty squares
        for (let i = 0; i < parseInt(char); i++) {
          row.push('');
        }
      } else {
        // Piece (pnbrqkPNBRQK)
        row.push(char);
      }
    }
    board.push(row);
  });

  return board;
}

// Usage
const board = fenToBoard('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
// Returns 8x8 array of piece characters
```

### Render Board as Grid

```typescript
function ChessBoard({ fen }: { fen: string }) {
  const board = fenToBoard(fen);

  return (
    <div className="grid grid-cols-8 gap-0 w-96 h-96">
      {board.map((rank, r) =>
        rank.map((piece, c) => (
          <div
            key={`${r}-${c}`}
            className={`w-12 h-12 flex items-center justify-center ${
              (r + c) % 2 === 0 ? 'bg-white' : 'bg-gray-300'
            }`}
          >
            <Piece symbol={piece} />
          </div>
        ))
      )}
    </div>
  );
}
```

---

## Page Templates

### Login Page
```typescript
// frontend/src/app/auth/login/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { token } = await login(email, password);
      localStorage.setItem('token', token);
      router.push('/lobby');
    } catch (err) {
      setError('Login failed');
    }
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

### Game Page
```typescript
// frontend/src/app/game/[gameId]/page.tsx
'use client';

import { useGame } from '@/contexts/GameContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function GamePage({ params }: { params: { gameId: string } }) {
  const { game, makeMove } = useGame();
  const { socket } = useWebSocket();
  const { user } = useAuth();

  useEffect(() => {
    // Subscribe to game
    socket.emit('subscribe_game', {
      gameId: params.gameId,
      userId: user?.id
    });

    // Listen for moves
    socket.on('move_made', (data) => {
      // Update board
    });

    // Listen for card usage
    socket.on('card_used', (data) => {
      // Update effects
    });

    return () => {
      socket.off('move_made');
      socket.off('card_used');
    };
  }, [params.gameId, socket, user?.id]);

  return (
    <div>
      <h1>Game {params.gameId}</h1>
      {/* Render game board, cards, etc. */}
    </div>
  );
}
```

---

## Development Workflow

### 1. Start Backend
```bash
cd backend
npm run start:dev
# Runs on http://localhost:3000/api
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3001
```

### 3. Test API Integration
```bash
# Use fetch or axios in component
const response = await apiCall('/games', { method: 'POST', body: { mode: 'online' } });
```

### 4. Test WebSocket
```typescript
// In component
const { socket } = useWebSocket();
socket.emit('ping');
socket.on('pong', (data) => console.log('Connected!'));
```

---

## Debugging Tips

### Check API Response
```typescript
try {
  const data = await apiCall('/api/endpoint');
  console.log('Success:', data);
} catch (error) {
  console.error('API Error:', error);
}
```

### Check WebSocket Connection
```typescript
const { socket, connected } = useWebSocket();
console.log('Socket connected:', connected);
console.log('Socket ID:', socket?.id);
```

### Check Game State
```typescript
const { game } = useGame();
console.log('Current game:', game);
console.log('Your cards:', game?.yourCards);
console.log('Turn:', game?.currentTurn);
```

### Enable Redux DevTools (if using Redux in future)
```typescript
// Check browser DevTools → Application → Local Storage
// Look for 'token' and other persisted state
```

---

## Performance Checklist

- [ ] Lazy load game pages with `dynamic()` import
- [ ] Memoize expensive components with `React.memo()`
- [ ] Use `useCallback` for event handlers
- [ ] Debounce move input (prevent spam)
- [ ] Disconnect socket when leaving game
- [ ] Clean up event listeners with `useEffect` cleanup

---

## Testing Strategy

### Unit Tests (Jest)
```bash
npm test
```

### E2E Tests (Playwright - if added)
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Login/register flow
- [ ] Create local game
- [ ] Create online game
- [ ] Join game by room code
- [ ] Make moves on board
- [ ] Use power cards
- [ ] Checkmate detection
- [ ] Game over screen
- [ ] Theme switching
- [ ] Responsiveness on mobile

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Cannot find module '@/lib/api'" | Import path issue | Check tsconfig `paths` config |
| "useAuth is not a hook" | Used outside provider | Wrap component with `<AuthProvider>` |
| "Socket is undefined" | WebSocket not connected | Check backend is running |
| "401 Unauthorized" | Missing/invalid token | Clear localStorage, re-login |
| "Board not rendering" | Bad FEN notation | Verify FEN from API response |

---

## Next Implementation Priority

1. **GameBoard Component** - Render chess board from FEN
2. **Move Input** - Click-to-move or drag-drop
3. **Card Hand UI** - Display 3 cards with play button
4. **Real-time Sync** - Subscribe to game, listen for opponent moves
5. **Game Over Screen** - Show winner and play again button

See [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md) for API integration examples.

See [`WEBSOCKET_GUIDE.md`](./WEBSOCKET_GUIDE.md) for real-time sync examples.
