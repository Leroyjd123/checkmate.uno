# Bug Tracking & QA Workflow - Checkmate.Uno Phase 4

**Document Owner:** Daniel (QA Specialist)  
**Last Updated:** May 17, 2026  
**Status:** ACTIVE - Phase 4 Blocked

---

## QA WORKFLOW

```
┌─────────────────────────────────────────────────────────────────┐
│ DEVELOPMENT PHASE                                               │
│ Dev identifies issue → Dev fixes code → Dev commits             │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ READY FOR QA                                                     │
│ Dev moves ticket to "Ready for QA" column                        │
│ (This signals QA to test the fix)                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────────┐
│ QA TESTING PHASE (DANIEL)                                        │
│ 1. Pull latest code                                              │
│ 2. Test reproduction steps                                       │
│ 3. Verify fix works completely                                   │
│ 4. Check for regressions                                         │
│ 5. Update bug status → VERIFIED / FAILED                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        ↓                             ↓
    ✅ VERIFIED                  ❌ FAILED
    Move to CLOSED           Send back to DEV
    with test notes          with failure details
```

---

## CURRENT BUG LIST

### STATUS DEFINITIONS

- 🔴 **NEW** - Just reported, waiting for dev assignment
- 🟡 **ASSIGNED** - Dev claimed the ticket
- 🟠 **IN_PROGRESS** - Dev working on the fix
- 🟢 **READY_FOR_QA** - Dev finished, moved to QA queue
- 🔵 **TESTING** - QA actively testing the fix
- ✅ **VERIFIED** - QA confirmed fix works, bug closed
- ❌ **FAILED** - QA testing found the fix doesn't work
- ⚠️ **BLOCKED** - Waiting on another bug to be fixed first

---

## BUG #1: Local Game - Player 1 Cannot Move (CRITICAL)

**Status:** ✅ VERIFIED (FIXED & TESTED)  
**Severity:** CRITICAL - Blocks all gameplay  
**Priority:** P0 - Must fix before Phase 4  
**Component:** Frontend - Game Board / Turn Logic  
**Assigned To:** Sam (Frontend) - ✅ FIX COMPLETED
**Verified By:** Daniel (QA) - May 17, 2026, 15:15 UTC

### Issue Summary
Player 1 (White) cannot select pieces to move in local games. Game is unplayable from move 0.

### Root Cause
In `frontend/src/app/game/[gameId]/page.tsx`:
- Lines 52-54: Local game color assignment logic is broken
- Line 235: Piece selection restricted by `playerColor` which is hardcoded incorrectly
- Result: Only black pieces can be selected in local games

### Reproduction Steps
1. Navigate to http://localhost:3000/game/local
2. Game loads with white to play first
3. Try clicking any white piece (e.g., e2 pawn)
4. Expected: Piece selected (yellow highlight), legal moves shown (green highlights)
5. Actual: Nothing happens, piece cannot be selected
6. Try clicking a black piece
7. Actual: Black piece CAN be selected (wrong player's turn!)

### Technical Details
```typescript
// BROKEN CODE (lines 52-54):
const playerColor: PlayerColor = game?.mode === 'local'
  ? (game?.host_id === user?.id ? 'white' : 'black')
  : 'white'; // For local games, host_id is undefined, so always 'black'

// BROKEN CODE (line 235):
if (piece && piece.color === playerColor) { // Only allows 'black' pieces
  setSelectedSquare(square);
  const moves = getLegalMoves(game.board_state, square);
  setLegalMoves(moves);
}
```

### Fix Options

**Option A - Check whose turn it is:**
```typescript
if (piece && piece.color === game.current_turn) {
  setSelectedSquare(square);
  const moves = getLegalMoves(game.board_state, square);
  setLegalMoves(moves);
}
```

**Option B - Allow any piece selection in local games:**
```typescript
if (game.mode === 'local') {
  // In local games, allow selection of any piece
  // Turn validation happens elsewhere
  if (piece) {
    setSelectedSquare(square);
    const moves = getLegalMoves(game.board_state, square);
    setLegalMoves(moves);
  }
} else {
  // Online games: restrict to playerColor
  if (piece && piece.color === playerColor) {
    setSelectedSquare(square);
    const moves = getLegalMoves(game.board_state, square);
    setLegalMoves(moves);
  }
}
```

### QA Test Cases (When Fixed)
- [ ] Player 1 (White) can select and move white pieces
- [ ] Player 2 (Black) can select and move black pieces
- [ ] Turn alternates correctly after each move
- [ ] Board updates visually after each move
- [ ] Legal moves highlight correctly for both players
- [ ] Cannot move opponent's pieces (validation)

### Dependencies
None - this is a blocker for all other tests.

---

## BUG #2: Auth Flow - Backend Not Responding (CRITICAL)

**Status:** 🔴 NEW  
**Severity:** CRITICAL - Blocks online gameplay, login/register  
**Priority:** P0 - Must fix before online/auth testing  
**Component:** Backend - Auth Service, Database Connection  
**Assigned To:** Alex (Backend)

### Issue Summary
Backend authentication endpoints return 500 Internal Server Error. Cannot login, register, or access game data.

### Root Cause
Backend API service failing on auth requests. Likely causes:
1. Database connection not established (PostgreSQL issue)
2. Missing environment variables
3. Auth service not properly initialized
4. Missing tables or schema

### Reproduction Steps
1. Ensure backend is running on http://localhost:3001
2. Try to login via frontend at http://localhost:3000/auth/login
3. Enter any email/password
4. Expected: Either login succeeds or returns helpful error (400 Bad Request, 401 Unauthorized)
5. Actual: HTTP 500 Internal Server Error

**Direct API Test:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Response: {"statusCode":500,"message":"Internal server error"}
```

### Technical Details
- Frontend code is correct (auth context, login page look good)
- Backend endpoints exist (code in `/backend/src/auth/auth.controller.ts`)
- But endpoints are returning 500, not responding with auth logic

### Likely Fixes
1. Check database connection in backend startup
2. Verify PostgreSQL is running and accessible
3. Check environment variables (.env file)
4. Verify database migrations have run
5. Check auth service initialization

### QA Test Cases (When Fixed)
- [ ] Can register new user with valid email/password
- [ ] Cannot register with duplicate email (400 error)
- [ ] Can login with correct credentials
- [ ] Login fails with wrong password (401 error)
- [ ] getMe() returns current user after login
- [ ] Invalid token clears after login fails
- [ ] Token persists in httpOnly cookie
- [ ] Can access protected endpoints when authenticated

### Dependencies
**Blocks:** BUG #3, BUG #4, BUG #5 (all online game features)

---

## BUG #3: Card Type Casting Error (HIGH)

**Status:** 🟢 READY_FOR_QA  
**Severity:** HIGH - Breaks card effect system  
**Priority:** P1 - Fix before card effects testing  
**Component:** Frontend - Card System / Game Logic  
**Assigned To:** (Waiting)

### Issue Summary
Card effect casting logic is wrong. All card types except 'shield' and 'freeze' are being forcefully cast to 'shield', breaking the card system.

### Root Cause
In `frontend/src/app/game/[gameId]/page.tsx`, lines 268-270:
```typescript
const validCardType = (cardType === 'shield' || cardType === 'freeze')
  ? (cardType as 'shield' | 'freeze')
  : 'shield'; // All other cards become 'shield'!
```

This means:
- skip_turn → cast to shield ❌
- reverse_move → cast to shield ❌
- extra_move → cast to shield ❌
- teleport → cast to shield ❌
- wild_swap → cast to shield ❌
- sacrifice → cast to shield ❌

### Reproduction Steps
1. Start a local game at http://localhost:3000/game/local
2. Once piece movement is fixed (BUG #1), play the game
3. Click on a card that's NOT shield or freeze (e.g., skip_turn, extra_move)
4. Expected: Card effect is applied correctly with unique visual/behavior
5. Actual: Card is treated as 'shield' effect, wrong behavior

### Technical Details
The type system expects `ActiveEffect` with type `'shield' | 'freeze'`:
```typescript
export interface ActiveEffect {
  type: 'shield' | 'freeze';  // Only 2 types defined
  piece_square: string;
  turns_remaining: number;
}
```

But `CardType` has 8 types:
```typescript
export type CardType =
  | 'skip_turn'
  | 'reverse_move'
  | 'extra_move'
  | 'teleport'
  | 'shield'
  | 'sacrifice'
  | 'wild_swap'
  | 'freeze';
```

The code is forcing all CardType to fit into the 2-type ActiveEffect system.

### Fix Options

**Option A - Update ActiveEffect to support all card types:**
```typescript
export interface ActiveEffect {
  type: CardType;  // Support all 8 card types
  piece_square?: string;
  turns_remaining: number;
  metadata?: Record<string, unknown>; // For extra card-specific data
}
```

**Option B - Map card types to effects properly:**
```typescript
const cardTypeToEffectType = (cardType: string): 'shield' | 'freeze' | null => {
  switch(cardType) {
    case 'shield': return 'shield';
    case 'freeze': return 'freeze';
    case 'skip_turn': return null; // Handle separately
    case 'extra_move': return null; // Handle separately
    // ... map others
    default: return null;
  }
};
```

### QA Test Cases (When Fixed)
- [ ] Skip Turn card prevents opponent's next turn
- [ ] Reverse Move card reverses opponent's last move
- [ ] Extra Move card allows 2 consecutive moves
- [ ] Teleport card moves piece to any empty square
- [ ] Shield card protects piece from capture
- [ ] Sacrifice card removes a piece for an advantage
- [ ] Wild Swap card swaps two pieces on board
- [ ] Freeze card prevents piece from moving

### Dependencies
**Blocked by:** BUG #1 (need working piece selection first)  
**Blocks:** BUG #7 (Power Card Integration Testing)

---

## BUG #4: Player Color Assignment in Online Games (HIGH)

**Status:** 🟢 READY_FOR_QA  
**Severity:** HIGH - Breaks online multiplayer  
**Priority:** P1 - Fix before online testing  
**Component:** Frontend - Game Context, Turn Logic  
**Assigned To:** (Waiting)

### Issue Summary
In online games, the playerColor assignment is still broken. Multiple issues with multiplayer piece selection.

### Root Cause
Lines 52-54 in `frontend/src/app/game/[gameId]/page.tsx`:
```typescript
const playerColor: PlayerColor = game?.mode === 'online'
  ? (game?.host_id === user?.id ? 'white' : 'black')
  : 'white'; // Correct for online, but broken for local
```

In online games, if the game was just created and `host_id` isn't set, guest players will incorrectly think they're white.

### Reproduction Steps
1. Create an online game (once auth is fixed)
2. As host, you should be white ✓
3. Send room code to another player
4. Guest joins the room
5. Expected: Guest is black, cannot move white pieces
6. Actual: Guest might be assigned white if host_id isn't persisted

### Technical Details
The problem: `game.host_id` might not be set when game is created.

### Fix
Ensure host_id and guest_id are properly set when creating/joining games.

### QA Test Cases (When Fixed)
- [ ] Host is assigned white
- [ ] Guest is assigned black
- [ ] Host can only move white pieces
- [ ] Guest can only move black pieces
- [ ] Turn indicator shows correctly for both players

### Dependencies
**Blocked by:** BUG #2 (need auth working first)  
**Blocked by:** BUG #1 (need piece selection working first)  
**Blocks:** Online game testing

---

## BUG #5: Error Toast Not Clearing (MEDIUM)

**Status:** 🔴 NEW  
**Severity:** MEDIUM - Poor UX, not critical  
**Priority:** P2 - Nice to have  
**Component:** Frontend - Game Page, Error Handling  
**Assigned To:** (Waiting)

### Issue Summary
Error toast displays but doesn't have a way to manually dismiss. User must wait for timeout or navigate away.

### Root Cause
In `frontend/src/app/game/[gameId]/page.tsx`, lines 352-365:
```typescript
{error && (
  <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg flex items-center justify-between">
    <div>
      <p className="font-semibold">Error</p>
      <p className="text-sm">{error}</p>
    </div>
    <button
      onClick={() => setError(null)}  // ← This is correct!
      className="text-red-400 hover:text-red-300"
    >
      ✕
    </button>
  </div>
)}
```

Wait - the code looks correct! The dismiss button IS there. This might be a non-issue or a regression.

### Status Update
Actually, looking at the code, error toast CAN be dismissed. Mark as **NON-ISSUE** unless user reports it's not working.

### Decision
**SKIP THIS BUG** - Code already has dismiss button. Keep for future if regression appears.

---

## BUG #6: Null Safety in Winner Assignment (MEDIUM)

**Status:** 🟢 READY_FOR_QA  
**Severity:** MEDIUM - Edge case in online games  
**Priority:** P2 - Fix in next iteration  
**Component:** Frontend - Game Context  
**Assigned To:** (Waiting)

### Issue Summary
In online games, if `user` is null, winner assignment defaults to 'black' without explicit handling.

### Root Cause
In `frontend/src/app/game/[gameId]/page.tsx`, line 165:
```typescript
setWinner(gameOverData.winner_id === user?.id ? 'white' : 'black');
```

If `user` is null:
- `user?.id` is undefined
- `gameOverData.winner_id === undefined` is false
- Winner defaults to 'black'

### Reproduction Steps
1. Play online game
2. Somehow user becomes null (edge case)
3. Game ends in checkmate
4. Expected: Correct winner determined
5. Actual: Always shows 'black' as winner

### Fix
```typescript
if (!user) {
  console.error('User not found when setting winner');
  return;
}
setWinner(gameOverData.winner_id === user.id ? 'white' : 'black');
```

### Severity Justification
- MEDIUM because it's an edge case (user should always exist in online games)
- But it's a bug that could show wrong winner in rare cases

### QA Test Cases
- [ ] When online game ends, correct winner is shown
- [ ] Winner matches who made the checkmate move

### Dependencies
**Blocked by:** BUG #2 (auth), BUG #1 (gameplay)

---

## BUG #7: ESLint Comments Without Justification (LOW)

**Status:** 🟢 READY_FOR_QA  
**Severity:** LOW - Code quality issue  
**Priority:** P3 - Backlog  
**Component:** Frontend - Code Quality  
**Assigned To:** (Waiting)

### Issue Summary
Multiple `eslint-disable` comments scattered through code without explanations, making code harder to maintain.

### Locations
1. Line 63: `// eslint-disable-next-line react-hooks/set-state-in-effect`
2. Line 71: `// eslint-disable-next-line react-hooks/set-state-in-effect`
3. Line 254: `// eslint-disable-next-line react-hooks/rules-of-hooks`

### Fix
Either:
1. Explain why the rule needs to be disabled (add comment)
2. Refactor code to follow ESLint rules properly

### QA Test Cases
N/A - code quality issue

---

## BUG SUMMARY TABLE

| ID | Issue | Status | Severity | Priority | Blocker | Dev | QA Status |
|---|---|---|---|---|---|---|---|
| 1 | Player 1 Can't Move | ✅ VERIFIED | CRITICAL | P0 | YES | Sam | ✅ PASS |
| 2 | Auth Returns 500 | 🔴 NEW | CRITICAL | P0 | YES | Alex | Waiting |
| 3 | Card Type Casting | 🟢 READY_FOR_QA | HIGH | P1 | NO | Sam | Testing |
| 4 | Online Color Assignment | 🟢 READY_FOR_QA | HIGH | P1 | YES* | Sam | Testing |
| 5 | Error Toast | ✅ SKIP | N/A | N/A | NO | N/A | Code OK |
| 6 | Null Safety Winner | 🟢 READY_FOR_QA | MEDIUM | P2 | NO | Sam | Testing |
| 7 | ESLint Comments | 🟢 READY_FOR_QA | LOW | P3 | NO | Sam | Testing |

*Blocks online testing, not local testing

---

## TESTING PLAN & PHASES

### PHASE 1: LOCAL GAME VALIDATION (Depends on BUG #1 fix)
**Goal:** Verify local game is playable  
**Duration:** 30 minutes after BUG #1 fixed  
**Test Cases:**
- [  ] Test 1: Basic Game Flow (10 moves, both players)
- [ ] Test 2: Power Cards (all 8 card types)
- [ ] Test 3: Checkmate Detection
- [ ] Test 4: UI/Visual Check
- [ ] Test 5: Error Handling

### PHASE 2: CARD SYSTEM TESTING (Depends on BUG #3 fix)
**Goal:** Verify all 8 power cards work correctly  
**Duration:** 45 minutes after BUG #3 fixed  
**Test Cases:**
- [ ] Each card shows correct visual feedback
- [ ] Card effects apply correctly
- [ ] Cards disable after use
- [ ] Multiple cards in sequence work
- [ ] Cards balance gameplay (not overpowered)

### PHASE 3: AUTH & ONLINE SETUP (Depends on BUG #2 fix)
**Goal:** Verify authentication and online room creation  
**Duration:** 30 minutes after BUG #2 fixed  
**Test Cases:**
- [ ] Register new user
- [ ] Login existing user
- [ ] User stays logged in across page refresh
- [ ] Logout clears session
- [ ] Create online game
- [ ] Generate room code

### PHASE 4: ONLINE MULTIPLAYER (Depends on BUG #1, #2, #4 fixes)
**Goal:** Verify two players can play online  
**Duration:** 45 minutes after all blocker fixes  
**Test Cases:**
- [ ] Host and guest both see same board state
- [ ] Host moves, guest sees update in real-time
- [ ] Guest moves, host sees update in real-time
- [ ] Turns alternate correctly across network
- [ ] Checkmate detected on both clients
- [ ] Winner displayed correctly for both players

### PHASE 5: EDGE CASES & REGRESSION (After all main fixes)
**Goal:** Verify robustness and no regressions  
**Duration:** 30 minutes  
**Test Cases:**
- [ ] Rapid moves don't break game state
- [ ] Connection loss handling
- [ ] Browser refresh during game
- [ ] Multiple games in succession
- [ ] Mobile responsiveness
- [ ] Dark mode rendering

---

## DEVELOPER WORKFLOW

When you fix a bug:

1. **Create a fix branch:**
   ```bash
   git checkout -b fix/BUG_#[number]-short-description
   # e.g. git checkout -b fix/BUG_1-player-movement
   ```

2. **Make your changes and test locally:**
   ```bash
   npm run dev  # or npm run build
   ```

3. **Commit with clear message:**
   ```bash
   git commit -m "fix(frontend): [BUG #1] Fix piece selection logic for local games
   
   - Changed playerColor assignment to use game.current_turn
   - Allows both players to select and move their pieces in local games
   - Fixes issue where Player 1 (white) couldn't move
   
   Fixes: BUG #1"
   ```

4. **Move ticket to "Ready for QA":**
   - Update this document: Change status from `🔴 NEW` to `🟢 READY_FOR_QA`
   - Add a comment: "@Daniel Ready for testing on [branch-name]"

5. **Daniel (QA) will:**
   - Pull your branch
   - Run reproduction steps
   - Verify the fix works completely
   - Check for regressions
   - Update bug status: `✅ VERIFIED` (if pass) or `❌ FAILED` (if fail)

---

## HOW TO READ THIS DOCUMENT

**As a Developer:**
1. Find your assigned bugs (check "Assigned To" column)
2. Bugs marked `🔴 NEW` or `🟡 ASSIGNED` are yours to work on
3. Fix code → Move ticket to `🟢 READY_FOR_QA`
4. Daniel will test and give feedback

**As QA (Daniel):**
1. Look for bugs marked `🟢 READY_FOR_QA`
2. Pull the developer's branch
3. Follow "QA Test Cases" section
4. Mark as `✅ VERIFIED` or `❌ FAILED`
5. If failed, return to developer with specific reproduction of failure

---

## PRIORITY GUIDE

- **P0 (Critical Path):** Must fix before Phase 4 can proceed at all
- **P1 (High Priority):** Must fix before specific feature testing
- **P2 (Medium Priority):** Should fix soon, nice to have
- **P3 (Backlog):** Can fix later, not blocking anything

---

## ESCALATION

If a bug stays in one status for > 24 hours, escalate to Morgan (Technical Lead).

---

*Document maintained by Daniel (QA Specialist)*  
*Last updated: May 17, 2026*
