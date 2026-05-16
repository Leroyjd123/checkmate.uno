# Checkmate.Uno — AI Development Rules & Context

## Document Purpose

This document provides instructions for AI assistants (Claude, GPT, etc.) working on the Checkmate.Uno codebase. It defines coding standards, architectural constraints, common pitfalls, and decision-making guidelines to ensure consistency across development sessions.

**Last Updated:** May 16, 2026  
**Version:** v1.0  

---

## Core Principles

### 1. Server Authority Always

**Rule:** The backend is the authoritative source for ALL game logic. The frontend is a display layer only.

**What this means:**
- Never implement move validation, checkmate detection, or power card effects ONLY on the frontend
- Always validate user actions server-side, even if client-side validation also exists
- Client-side validation is for UX optimization only (highlight legal moves, prevent obviously illegal clicks)
- If client and server disagree, server is ALWAYS correct

**Example:**
```typescript
// ❌ WRONG — Frontend decides if move is legal
if (isMoveLegal(from, to)) {
  updateBoardState(from, to);
  notifyOpponent(from, to);
}

// ✅ CORRECT — Frontend asks server, server decides
const response = await api.executeMove(gameId, from, to);
if (response.ok) {
  updateBoardState(response.boardState);
} else {
  revertOptimisticUpdate();
  showError(response.error);
}
```

---

### 2. Optimistic Updates with Revert

**Rule:** Update UI immediately for responsive feel, but always revert if server rejects.

**Pattern:**
1. User action triggers UI update (optimistic)
2. Send API request
3. On success: state already correct (no action needed)
4. On failure: revert UI to previous state, show error

**Example:**
```typescript
// ✅ CORRECT optimistic update pattern
function handleMovePiece(from: string, to: string) {
  const previousState = cloneDeep(gameState);
  
  // Optimistic update
  updateBoardImmediately(from, to);
  
  // Server validation
  api.executeMove(gameId, from, to)
    .then(response => {
      // Success — state already correct
      updateGameContext(response);
    })
    .catch(error => {
      // Failure — revert optimistic update
      restoreGameState(previousState);
      showErrorToast(error.message);
    });
}
```

---

### 3. No Sensitive Data in Logs

**Rule:** Never log passwords, JWT tokens, email addresses, or room codes.

**What to log:**
- API endpoint called, HTTP status code
- Game ID, move coordinates (from/to)
- Card type used, target square
- Error messages (sanitized)

**What NOT to log:**
- User passwords (ever)
- JWT tokens (only first 8 chars if needed: `${token.slice(0, 8)}...`)
- Email addresses (only domain: `user@*****.com`)
- Room codes in production (only in dev mode)

---

### 4. FEN Notation is Sacred

**Rule:** Always use FEN (Forsyth-Edwards Notation) for board state. Never invent custom formats.

**Why FEN:**
- Chess standard since 1883
- Compatible with chess.js and all chess libraries
- Compact (80 bytes vs 500+ bytes JSON)
- Debuggable with any chess tool (lichess.org/editor)

**Example FEN:**
```
rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1
```

**Never do this:**
```typescript
// ❌ WRONG — Custom board format
const board = {
  a1: {piece: 'rook', color: 'white'},
  a2: {piece: 'pawn', color: 'white'},
  // ...64 more entries
};
```

---

### 5. WebSocket for Broadcasts, REST for State Changes

**Rule:** Use REST API for CRUD operations (create game, make move, use card). Use WebSocket only for real-time notifications to opponents.

**REST API:**
- POST /api/games (create game)
- POST /api/games/:id/move (make move)
- POST /api/games/:id/use-card (use card)
- GET /api/games/:id (fetch state)

**WebSocket:**
- `opponent_joined` (notify host that guest joined)
- `move_made` (notify opponent of move)
- `card_used` (notify opponent of card)
- `game_over` (notify both players of result)

**Never do this:**
```typescript
// ❌ WRONG — Using WebSocket for state queries
socket.emit('get_game_state', {game_id}, (response) => {
  setGameState(response);
});

// ✅ CORRECT — Use REST for state queries
const response = await fetch(`/api/games/${gameId}`);
const gameState = await response.json();
setGameState(gameState);
```

---

## Stack-Specific Rules

### Backend (NestJS)

#### Rule 1: Use Prisma for ALL Database Access

```typescript
// ✅ CORRECT
const game = await this.prisma.games.findUnique({
  where: {id: gameId}
});

// ❌ WRONG — Never use raw SQL
const game = await this.prisma.$queryRaw`SELECT * FROM games WHERE id = ${gameId}`;
```

#### Rule 2: Wrap Multi-Step Operations in Transactions

```typescript
// ✅ CORRECT
await this.prisma.$transaction(async (tx) => {
  await tx.games.update({where: {id}, data: {status: 'completed'}});
  await tx.game_cards.updateMany({where: {game_id: id}, data: {status: 'used'}});
});

// ❌ WRONG — Separate operations can fail halfway
await this.prisma.games.update({where: {id}, data: {status: 'completed'}});
await this.prisma.game_cards.updateMany({where: {game_id: id}, data: {status: 'used'}});
```

#### Rule 3: Always Validate DTOs with class-validator

```typescript
// ✅ CORRECT
import {IsString, IsIn} from 'class-validator';

export class MakeMoveDto {
  @IsString()
  from: string;
  
  @IsString()
  to: string;
}

// ❌ WRONG — No validation
export class MakeMoveDto {
  from: string;
  to: string;
}
```

#### Rule 4: Power Card Effects Must Modify active_effects JSONB, Not Create Separate Tables

```typescript
// ✅ CORRECT — Fetch, spread, update
const game = await this.prisma.games.findUnique({ where: { id: gameId } });
const updatedEffects = [
  ...(game.active_effects as any[]),
  { type: 'shield', pieceSquare: 'e4', turnsRemaining: 3, appliedBy: 'white' }
];
await this.prisma.games.update({
  where: { id: gameId },
  data: { active_effects: updatedEffects }
});

// ❌ WRONG — MongoDB syntax (Prisma doesn't support push on JSONB arrays)
await this.prisma.games.update({
  where: {id: gameId},
  data: {
    active_effects: {
      push: {type: 'shield', pieceSquare: 'e4', turnsRemaining: 3}
    }
  }
});

// ❌ WRONG — Separate table for ephemeral data
await this.prisma.active_effects.create({
  data: {game_id: gameId, type: 'shield', piece_square: 'e4', turns_remaining: 3}
});
```

---

### Frontend (Next.js / React)

#### Rule 1: Use Context API for Global State, Local State for Component State

```typescript
// ✅ CORRECT — Global state in Context
const {gameState, updateGameState} = useGameContext();

// ✅ CORRECT — Local state for UI
const [isCardSelected, setIsCardSelected] = useState(false);

// ❌ WRONG — Local state for game data (should be in Context)
const [boardState, setBoardState] = useState(initialFen);
```

#### Rule 2: Always TypeScript, Never `any`

```typescript
// ✅ CORRECT
interface GameState {
  boardState: string;
  currentTurn: 'white' | 'black';
  activeEffects: ActiveEffect[];
}

const [game, setGame] = useState<GameState>(initialState);

// ❌ WRONG
const [game, setGame] = useState<any>(initialState);
```

#### Rule 3: WebSocket Reconnection Must Re-Subscribe to Game Room

```typescript
// ✅ CORRECT
socket.on('connect', () => {
  console.log('WebSocket connected');
  socket.emit('join_room', {game_id: gameId});
});

// ❌ WRONG — No room re-join on reconnect
socket.on('connect', () => {
  console.log('WebSocket connected');
  // Missing room re-join — won't receive events after reconnect
});
```

#### Rule 4: Theme Switching Must Update Both Context and LocalStorage

```typescript
// ✅ CORRECT
function setTheme(newTheme: Theme) {
  updateThemeContext(newTheme);
  localStorage.setItem('theme_preference', newTheme);
  if (isAuthenticated) {
    api.updateUserPreferences({theme: newTheme}); // Async, fire-and-forget
  }
}

// ❌ WRONG — Only updates Context (lost on page reload)
function setTheme(newTheme: Theme) {
  updateThemeContext(newTheme);
}
```

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: Trusting Client-Side Game State

**Problem:** Frontend calculates checkmate, declares winner, skips asking server.

**Solution:** Always call backend to validate checkmate. Frontend can show optimistic "Checkmate!" UI, but server must confirm.

```typescript
// ✅ CORRECT
const response = await api.executeMove(gameId, from, to);
if (response.isCheckmate) {
  showWinnerModal(response.winnerId);
}

// ❌ WRONG
const isCheckmate = chess.isCheckmate();
if (isCheckmate) {
  showWinnerModal(currentPlayer);
}
```

---

### Pitfall 2: Forgetting to Expire Active Effects

**Problem:** Shield card applied, 3 turns pass, shield still active.

**Solution:** Backend must decrement `turnsRemaining` after EVERY move and remove effects with 0 turns.

```typescript
// ✅ CORRECT — In move execution logic
const updatedEffects = game.active_effects
  .map(effect => ({
    ...effect,
    turnsRemaining: effect.appliedBy !== currentTurn ? effect.turnsRemaining - 1 : effect.turnsRemaining
  }))
  .filter(effect => effect.turnsRemaining > 0);

await this.prisma.games.update({
  where: {id: gameId},
  data: {active_effects: updatedEffects}
});
```

---

### Pitfall 3: Room Code Collisions Not Handled

**Problem:** Generated room code already exists, game creation fails silently.

**Solution:** Retry generation up to 3 times, return error if all fail.

```typescript
// ✅ CORRECT
async generateUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = this.generateRandomCode();
    const existing = await this.prisma.games.findFirst({
      where: {room_code: code, status: {in: ['waiting', 'in_progress']}}
    });
    if (!existing) return code;
  }
  throw new Error('Failed to generate unique room code after 3 attempts');
}
```

---

### Pitfall 4: WebSocket Events Not Reaching Opponent

**Problem:** Move made, WebSocket emits event, but opponent's UI doesn't update.

**Debugging Checklist:**
1. Is opponent connected to WebSocket? (Check `socket.connected` in browser console)
2. Is opponent subscribed to correct room? (Check `socket.emit('join_room')` was called)
3. Is server emitting to correct room? (Backend logs should show `io.to(gameId).emit(...)`)
4. Is frontend listening for correct event name? (Check `socket.on('move_made', ...)` matches backend emit)

---

### Pitfall 5: Card Targeting Mode Gets Stuck

**Problem:** User activates Teleport card, enters targeting mode, but can't exit or select target.

**Solution:** Always provide Escape key listener and Cancel button.

```typescript
// ✅ CORRECT
useEffect(() => {
  if (isTargetingMode) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitTargetingMode();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }
}, [isTargetingMode]);
```

---

## Testing Requirements

### Backend Tests

**Unit Tests (Required for All Services):**
- Chess move validation (legal/illegal moves)
- Power card effect application (each card type)
- Active effect expiration logic
- Room code generation and collision handling

**Integration Tests (Required for Critical Flows):**
- Full game flow: create game → make moves → checkmate
- Power card flow: use card → verify effect applied → verify effect expires
- Online multiplayer flow: create room → join room → play game

**Example Test:**
```typescript
describe('Shield Card', () => {
  it('should prevent capture of shielded piece', async () => {
    const game = await createTestGame();
    await useCard(game.id, 'shield', {piece_square: 'e4'});
    
    const moveResult = await executeMove(game.id, 'd5', 'e4'); // Attempt capture
    
    expect(moveResult.error).toBe('This piece is shielded');
    expect(moveResult.boardState).toEqual(game.board_state); // Board unchanged
  });
});
```

---

### Frontend Tests

**Component Tests (Required for All Interactive Components):**
- GameBoard renders correctly from FEN
- PowerCard activates targeting mode on click
- Winner modal displays correct winner

**Integration Tests (Required for Critical Flows):**
- User can drag piece and complete move
- User can activate card and select target
- User can create room and see room code

**E2E Tests (Required for Full User Journeys):**
- Register → Login → Create Room → Copy Code → Join Room (second browser) → Play Game → Checkmate

**Example Test:**
```typescript
describe('Power Card Activation', () => {
  it('should enter targeting mode when Shield card clicked', () => {
    render(<CardHand cards={[{type: 'shield', id: '1'}]} />);
    
    fireEvent.click(screen.getByText('Shield'));
    
    expect(screen.getByText('Select a piece to shield')).toBeInTheDocument();
  });
});
```

---

## Performance Rules

### Rule 1: Optimize React Re-Renders

**Use React.memo for expensive components:**
```typescript
// ✅ CORRECT
const GameBoard = React.memo(({boardState, onMove}) => {
  // Expensive rendering logic
});

// ❌ WRONG — Re-renders on every parent update
const GameBoard = ({boardState, onMove}) => {
  // Expensive rendering logic
};
```

---

### Rule 2: Debounce Expensive Operations

**Example: Room code validation on input change**
```typescript
// ✅ CORRECT
const debouncedValidate = useMemo(
  () => debounce((code: string) => validateRoomCode(code), 300),
  []
);

// ❌ WRONG — Validates on every keystroke
onChange={(e) => validateRoomCode(e.target.value)}
```

---

### Rule 3: Use Indexes for Frequently Queried Fields

**Required Indexes (Backend):**
- `games.room_code` (unique)
- `games.status`
- `game_cards.game_id`
- Composite: `(game_cards.game_id, game_cards.player_id, game_cards.status)`

---

## Security Rules

### Rule 1: Validate JWT on ALL Authenticated Endpoints

```typescript
// ✅ CORRECT
@UseGuards(JwtAuthGuard)
@Post('games/:id/move')
async executeMove(@Param('id') id: string, @User() user: UserEntity) {
  // user is authenticated, proceed
}

// ❌ WRONG — No auth guard
@Post('games/:id/move')
async executeMove(@Param('id') id: string) {
  // Anyone can call this — security hole
}
```

---

### Rule 2: Verify User Owns Game Before Allowing Actions

```typescript
// ✅ CORRECT
const game = await this.prisma.games.findUnique({where: {id}});
if (game.host_id !== user.id && game.guest_id !== user.id) {
  throw new ForbiddenException('Not a participant in this game');
}

// ❌ WRONG — No ownership check
const game = await this.prisma.games.findUnique({where: {id}});
// Proceed without verification
```

---

### Rule 3: Sanitize All User Inputs

```typescript
// ✅ CORRECT — Use DTOs with class-validator
class CreateGameDto {
  @IsEnum(['local', 'computer', 'online'])
  mode: string;
}

// ❌ WRONG — Trust user input directly
async createGame(@Body() body: any) {
  const mode = body.mode; // Could be anything
}
```

---

## Debugging Guidelines

### When Move is Rejected Server-Side

**Check in order:**
1. Is it player's turn? (`current_turn` matches player color)
2. Is move legal per chess rules? (chess.js `move()` returns non-null)
3. Is source piece frozen? (check `active_effects` for freeze on source square)
4. Is destination piece shielded? (check `active_effects` for shield on destination square)
5. Does move leave king in check? (chess.js `inCheck()` after move)

---

### When WebSocket Event Not Received

**Check in order:**
1. Is socket connected? (Browser console: `socket.connected`)
2. Is client subscribed to room? (Backend logs: "Client joined room X")
3. Is server emitting to room? (Backend logs: "Emitted move_made to room X")
4. Is client listening for event? (Frontend code: `socket.on('move_made', ...)`)
5. Is payload correct? (Console log event payload on both server and client)

---

### When Checkmate Not Detected

**Check in order:**
1. Is chess.js `isCheckmate()` called after move?
2. Is king actually in check? (chess.js `inCheck()` returns true)
3. Are all legal moves exhausted? (chess.js `moves()` returns empty array)
4. Are active effects preventing checkmate? (e.g., shield on king)

---

## Decision-Making Framework for AI Assistants

### When User Requests Feature Not in PRD

**Response Pattern:**
1. Acknowledge the request
2. Explain why it's not in MVP scope
3. Suggest deferring to post-MVP iteration
4. Offer alternative within scope if applicable

**Example:**
> User: "Can we add a chat feature?"
> 
> AI: "Chat is a great idea for player engagement! It's not in the MVP scope (listed in PRD Out of Scope section) to keep the initial launch focused. I'd recommend adding it in Iteration 3 (Weeks 15-18) along with other social features like friend lists. For MVP, players can share room codes via any external chat (Discord, iMessage, etc.). Would you like me to add chat to the post-MVP roadmap with an estimated effort?"

---

### When User Requests Breaking Change to Architecture

**Response Pattern:**
1. Ask clarifying questions to understand the motivation
2. Explain current architecture decision and why it was chosen
3. Outline pros/cons of proposed change
4. Recommend course of action with rationale

**Example:**
> User: "Let's use Redux instead of Context API"
> 
> AI: "Before we switch, can you help me understand what Context API isn't handling well? (e.g., performance issues, dev experience). The current architecture uses Context because [reasons from FRD Decision 2]. Switching to Redux would add ~20KB to bundle and require refactoring all state logic (~3-5 days work). However, if the app is experiencing re-render performance issues or state complexity is growing beyond initial estimates, Redux or Zustand might be worth it. What specific problem are you trying to solve?"

---

### When User Reports Bug

**Response Pattern:**
1. Ask for reproduction steps if not provided
2. Reference failure mode section in TRD/FRD if applicable
3. Provide debugging checklist
4. Offer to write fix with tests

**Example:**
> User: "Opponent's moves aren't showing up"
> 
> AI: "Let's debug this WebSocket issue. Can you confirm: (1) Both players are in the same game (same gameId in URL)? (2) Backend logs show 'Emitted move_made to room X'? (3) Frontend console shows 'WebSocket connected'? This sounds like Failure Mode 2 from the FRD (WebSocket Disconnection). Let's check [debugging checklist]. Once we identify the root cause, I'll write a fix with a test to prevent regression."

---

## Document Maintenance

### When to Update This Document

- New architectural decision made (add to "Core Principles")
- New common pitfall discovered (add to "Common Pitfalls")
- New stack technology added (add to "Stack-Specific Rules")
- Security vulnerability found (add to "Security Rules")

### How to Update

1. Add new section under relevant category
2. Include code examples (✅ correct, ❌ wrong)
3. Update version number and Last Updated date
4. Notify team of changes (if working with humans)

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | May 16, 2026 | AI Development Team | Initial AI rules document |
