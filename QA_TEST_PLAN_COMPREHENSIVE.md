# COMPREHENSIVE QA TEST PLAN
**Application:** Checkmate.Uno  
**Version:** Phase 4 Integration  
**Test Environment:** localhost:3000 (Frontend) + localhost:3001 (Backend)  
**Tester:** Daniel (QA Specialist)  
**Date:** May 17, 2026  
**Execution Time:** 10:00 PM - 10:30 PM UTC

---

## TEST PLAN OVERVIEW

**Total Test Cases:** 48  
**Critical Path Cases:** 12 (must pass)  
**Full Suite Cases:** 48 (comprehensive)  
**Estimated Duration:** 30 minutes  
**Pass Threshold:** 100% of critical path + 95% of full suite

---

---

# SECTION 1: AUTHENTICATION TESTS (4 test cases)

## TC-AUTH-001: User Registration

**Test ID:** TC-AUTH-001  
**Component:** /auth/register  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Application is running
- User is on homepage
- Browser console is open

### Test Steps:
1. Click "Register" button on homepage
2. Wait for registration page to load
3. Fill in Email field: `testuser@qa.local`
4. Fill in Password field: `TestPassword123!`
5. Fill in Confirm Password field: `TestPassword123!`
6. Click "Register" button
7. Wait for response (max 3 seconds)
8. Observe page redirect

### Expected Results:
- ✅ Registration form loads without errors
- ✅ All input fields accept text
- ✅ POST request sent to `/api/auth/register`
- ✅ Backend returns 201 Created with user data
- ✅ JWT token received and stored
- ✅ User is redirected to /lobby or authenticated state
- ✅ Browser console shows NO errors
- ✅ Account can be verified by attempting login

### Failure Criteria:
- ❌ Form does not submit
- ❌ No API call made
- ❌ 4xx or 5xx response from backend
- ❌ Browser console errors
- ❌ No token received
- ❌ User not logged in after registration

### Pass / Fail: ________

---

## TC-AUTH-002: User Login

**Test ID:** TC-AUTH-002  
**Component:** /auth/login  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Account exists (from TC-AUTH-001 or pre-created)
- User is on homepage
- Browser console is open

### Test Steps:
1. Click "Login" button on homepage
2. Wait for login page to load
3. Fill in Email field: `testuser@qa.local`
4. Fill in Password field: `TestPassword123!`
5. Click "Login" button
6. Wait for response (max 3 seconds)
7. Observe page state

### Expected Results:
- ✅ Login form loads without errors
- ✅ POST request sent to `/api/auth/login`
- ✅ Backend returns 200 OK with JWT token
- ✅ Token is stored securely (httpOnly cookie or localStorage)
- ✅ User is authenticated (can access /lobby)
- ✅ User object is available in context
- ✅ Browser console shows NO errors

### Failure Criteria:
- ❌ Form does not submit
- ❌ No API call made
- ❌ 401/403 authentication error
- ❌ Browser console errors
- ❌ No token received
- ❌ Cannot access protected routes

### Pass / Fail: ________

---

## TC-AUTH-003: Invalid Credentials

**Test ID:** TC-AUTH-003  
**Component:** /auth/login  
**Severity:** HIGH  
**Test Type:** Error Handling

### Prerequisites:
- Valid account exists
- User is on login page
- Browser console is open

### Test Steps:
1. Fill in Email field: `testuser@qa.local`
2. Fill in Password field: `WrongPassword123`
3. Click "Login" button
4. Wait for response (max 3 seconds)
5. Observe error message

### Expected Results:
- ✅ API request is sent
- ✅ Backend returns 401 Unauthorized
- ✅ User-friendly error message displayed
- ✅ No token is issued
- ✅ User is NOT logged in
- ✅ Can try again

### Failure Criteria:
- ❌ No error message shown
- ❌ User is logged in with wrong password
- ❌ Browser crashes
- ❌ Cryptic error message

### Pass / Fail: ________

---

## TC-AUTH-004: Token Persistence

**Test ID:** TC-AUTH-004  
**Component:** Auth Context / Token Storage  
**Severity:** HIGH  
**Test Type:** Functional

### Prerequisites:
- User is logged in (from TC-AUTH-002)
- Browser console is open

### Test Steps:
1. User is logged in and on /lobby
2. Refresh the page (F5 or Cmd+R)
3. Wait for page to reload
4. Observe if user is still logged in

### Expected Results:
- ✅ Page reloads successfully
- ✅ Token is restored from storage
- ✅ User is still logged in
- ✅ User context is populated
- ✅ Can access protected routes

### Failure Criteria:
- ❌ User is logged out after refresh
- ❌ Token is lost
- ❌ Page crashes
- ❌ 401 error after refresh

### Pass / Fail: ________

---

---

# SECTION 2: LOCAL GAME TESTS (14 test cases)

## TC-LOCAL-001: Game Initialization

**Test ID:** TC-LOCAL-001  
**Component:** Local Game Page  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- User is on homepage (logged in or not)
- Browser console is open

### Test Steps:
1. Click "Play Local" button on homepage
2. Wait for game page to load (max 3 seconds)
3. Observe game board and pieces

### Expected Results:
- ✅ Game page loads without errors
- ✅ Chess board displays 8x8 grid
- ✅ All pieces are in starting positions:
  - White pieces at rows 1-2
  - Black pieces at rows 7-8
- ✅ Game statistics panel displays
- ✅ Power cards panel displays with 3 cards
- ✅ Timer shows 0:00
- ✅ Browser console shows NO errors

### Failure Criteria:
- ❌ Game page does not load
- ❌ Board is missing or malformed
- ❌ Pieces are not in correct starting positions
- ❌ Components missing (stats, cards, timer)
- ❌ Browser console errors

### Pass / Fail: ________

---

## TC-LOCAL-002: Piece Colors - White Correct

**Test ID:** TC-LOCAL-002  
**Component:** ChessBoard Rendering  
**Severity:** CRITICAL  
**Test Type:** Visual

### Prerequisites:
- Local game is loaded (from TC-LOCAL-001)

### Test Steps:
1. Observe white pieces at bottom of board (rows 1-2)
2. Verify visual appearance of white pieces
3. Confirm white pieces are WHITE color (light/pale)

### Expected Results:
- ✅ White pawns (row 2) are WHITE color
- ✅ White pieces (row 1) are WHITE color
- ✅ All white pieces are visually distinct and light-colored
- ✅ Pieces are clearly readable

### Failure Criteria:
- ❌ White pieces are dark/black colored
- ❌ White pieces cannot be distinguished from board
- ❌ Colors are inverted or wrong

### Pass / Fail: ________

---

## TC-LOCAL-003: Piece Colors - Black Correct

**Test ID:** TC-LOCAL-003  
**Component:** ChessBoard Rendering  
**Severity:** CRITICAL  
**Test Type:** Visual

### Prerequisites:
- Local game is loaded (from TC-LOCAL-001)

### Test Steps:
1. Observe black pieces at top of board (rows 7-8)
2. Verify visual appearance of black pieces
3. Confirm black pieces are BLACK color (dark)

### Expected Results:
- ✅ Black pawns (row 7) are BLACK color
- ✅ Black pieces (row 8) are BLACK color
- ✅ All black pieces are visually distinct and dark
- ✅ Black pieces are clearly different from white pieces
- ✅ Pieces are clearly readable

### Failure Criteria:
- ❌ Black pieces are white colored
- ❌ Black pieces are same color as white pieces
- ❌ Cannot distinguish player pieces
- ❌ **BUG #1 - This is the critical rendering bug**

### Pass / Fail: ________

---

## TC-LOCAL-004: White Piece Selection

**Test ID:** TC-LOCAL-004  
**Component:** Piece Selection / handleSquareClick  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game is loaded
- It's white's turn (game start)

### Test Steps:
1. Click on white pawn at e2
2. Wait 1 second
3. Observe piece and board state

### Expected Results:
- ✅ Clicked piece is highlighted/selected (visual feedback)
- ✅ Legal moves are shown (highlighted squares)
- ✅ Legal moves include: d3, e3, d4 (if standard pawn moves)
- ✅ Game state updates: selectedSquare = "e2"
- ✅ No errors in browser console

### Failure Criteria:
- ❌ Piece is not selected
- ❌ No visual feedback
- ❌ No legal moves shown
- ❌ Click does nothing
- ❌ **BUG #14 - Cannot move pieces**

### Pass / Fail: ________

---

## TC-LOCAL-005: White Piece Movement

**Test ID:** TC-LOCAL-005  
**Component:** Move Execution  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- White piece is selected (from TC-LOCAL-004)
- Legal move is highlighted

### Test Steps:
1. Click on highlighted legal move square (e.g., e4)
2. Wait 1 second
3. Observe board state

### Expected Results:
- ✅ Piece moves from e2 to e4
- ✅ Board updates with new position
- ✅ e2 is now empty
- ✅ e4 now contains the white pawn
- ✅ Turn changes to black
- ✅ No errors in console

### Failure Criteria:
- ❌ Piece does not move
- ❌ Board state does not update
- ❌ Turn does not change
- ❌ Multiple pieces in same square
- ❌ Console errors

### Pass / Fail: ________

---

## TC-LOCAL-006: Turn Alternation

**Test ID:** TC-LOCAL-006  
**Component:** Turn Management  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- White has made a move (from TC-LOCAL-005)
- Black's turn

### Test Steps:
1. Try to click a white piece
2. Observe if selection works
3. Click a black piece at e7
4. Verify black piece can be selected
5. Move black piece
6. Verify turn returns to white

### Expected Results:
- ✅ Cannot select white pieces on black's turn
- ✅ Can select black pieces on black's turn
- ✅ Black piece moves successfully
- ✅ Turn alternates back to white
- ✅ Can select white pieces again

### Failure Criteria:
- ❌ Can move both colors on same turn
- ❌ Turn does not alternate
- ❌ Wrong player can move

### Pass / Fail: ________

---

## TC-LOCAL-007: Capture Pieces

**Test ID:** TC-LOCAL-007  
**Component:** Capture Logic / Move Execution  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game in progress (several moves made)

### Test Steps:
1. Set up a capture scenario (e.g., pawn can capture enemy piece)
2. Click attacking piece
3. Click enemy piece to capture
4. Wait 1 second
5. Observe board

### Expected Results:
- ✅ Enemy piece is removed from board
- ✅ Attacking piece moves to captured piece's square
- ✅ Captured piece count increments
- ✅ No errors in console

### Failure Criteria:
- ❌ Piece cannot capture
- ❌ Enemy piece is not removed
- ❌ Piece does not move to captured square

### Pass / Fail: ________

---

## TC-LOCAL-008: White Captured Counter

**Test ID:** TC-LOCAL-008  
**Component:** Game Statistics / Capture Tracking  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- White has captured at least 2 black pieces (from TC-LOCAL-007)

### Test Steps:
1. Look at "White Captured" field in stats panel
2. Observe the number displayed
3. Verify it matches actual captured pieces

### Expected Results:
- ✅ "White Captured" shows count (2 or higher)
- ✅ Number matches pieces removed from board
- ✅ Counter updates after each capture
- ✅ Not frozen at 0

### Failure Criteria:
- ❌ Shows 0 when pieces are captured
- ❌ Does not update
- ❌ Shows wrong count
- ❌ **BUG #3A - Captures not tracked**

### Pass / Fail: ________

---

## TC-LOCAL-009: Black Captured Counter

**Test ID:** TC-LOCAL-009  
**Component:** Game Statistics / Capture Tracking  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Black has captured at least 1 white piece

### Test Steps:
1. Look at "Black Captured" field in stats panel
2. Observe the number displayed
3. Verify it matches actual captured pieces

### Expected Results:
- ✅ "Black Captured" shows count (1 or higher)
- ✅ Number matches pieces removed from board
- ✅ Counter updates after each capture
- ✅ Not frozen at 0

### Failure Criteria:
- ❌ Shows 0 when pieces are captured
- ❌ Does not update
- ❌ Shows wrong count

### Pass / Fail: ________

---

## TC-LOCAL-010: Move History Tracking

**Test ID:** TC-LOCAL-010  
**Component:** Game Statistics / Move Recording  
**Severity:** HIGH  
**Test Type:** Functional

### Prerequisites:
- Local game in progress (at least 5 moves made)

### Test Steps:
1. Look at "Move History" section in stats panel
2. Observe displayed moves
3. Verify moves match actual game progression

### Expected Results:
- ✅ Move history is NOT empty
- ✅ Moves are listed in order (white, black, white, black, ...)
- ✅ Move notation is correct (e.g., "e2-e4", "c7-c5")
- ✅ Number of moves matches actual game moves
- ✅ Moves update after each turn

### Failure Criteria:
- ❌ Move history is blank
- ❌ Moves are not displayed
- ❌ Moves do not update
- ❌ **BUG #3B - Move history blank**

### Pass / Fail: ________

---

## TC-LOCAL-011: Time Elapsed Counter

**Test ID:** TC-LOCAL-011  
**Component:** Game Statistics / Timer  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game is loaded

### Test Steps:
1. Observe "Time Elapsed" field at game start
2. Verify it shows 0:00
3. Wait 5 seconds without making moves
4. Observe "Time Elapsed" after 5 seconds
5. Verify it shows approximately 0:05
6. Wait another 5 seconds
7. Verify it shows approximately 0:10

### Expected Results:
- ✅ Timer starts at 0:00
- ✅ Timer increments every second
- ✅ After 5 seconds shows 0:05
- ✅ After 10 seconds shows 0:10
- ✅ Format is MM:SS or M:SS
- ✅ Timer is accurate (±1 second tolerance)

### Failure Criteria:
- ❌ Starts at wrong value
- ❌ Does not increment
- ❌ Increments incorrectly (e.g., 0:00 → 0:30)
- ❌ Shows random large numbers
- ❌ **BUG #3C - Timer wrong value**

### Pass / Fail: ________

---

## TC-LOCAL-012: Checkmate Detection

**Test ID:** TC-LOCAL-012  
**Component:** Game End / Checkmate Logic  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game in progress

### Test Steps:
1. Play to checkmate (Scholar's Mate or setup specific board state)
2. Make final move that puts opponent in checkmate
3. Wait for game response
4. Observe screen

### Expected Results:
- ✅ Game automatically detects checkmate
- ✅ GameOver modal appears
- ✅ Modal displays winner (e.g., "White wins!")
- ✅ Modal shows game statistics (moves, duration)
- ✅ "Play Again" button is available
- ✅ No errors in console

### Failure Criteria:
- ❌ Checkmate is not detected
- ❌ Game continues after checkmate
- ❌ Modal does not appear
- ❌ Wrong winner displayed
- ❌ Cannot play again

### Pass / Fail: ________

---

## TC-LOCAL-013: Game Over Modal

**Test ID:** TC-LOCAL-013  
**Component:** GameOver Modal / UI  
**Severity:** HIGH  
**Test Type:** Visual/Functional

### Prerequisites:
- Game is in checkmate state (from TC-LOCAL-012)
- GameOver modal is displayed

### Test Steps:
1. Verify modal displays:
   - Winner announcement
   - Move count
   - Cards used count
   - Game duration
2. Click "Play Again" button
3. Observe game resets

### Expected Results:
- ✅ All stats are displayed in modal
- ✅ Stats are accurate
- ✅ "Play Again" button loads new game
- ✅ New game starts fresh
- ✅ No errors

### Failure Criteria:
- ❌ Modal is missing information
- ❌ Stats are wrong
- ❌ "Play Again" doesn't work

### Pass / Fail: ________

---

## TC-LOCAL-014: Console Errors - Local Game

**Test ID:** TC-LOCAL-014  
**Component:** Error Handling / Console  
**Severity:** CRITICAL  
**Test Type:** Error Handling

### Prerequisites:
- Played complete local game (from TC-LOCAL-001 through TC-LOCAL-013)
- Browser console is visible

### Test Steps:
1. Review browser console throughout game
2. Look for any JavaScript errors
3. Look for any warnings (except expected warnings)
4. Note any errors encountered

### Expected Results:
- ✅ Console is CLEAN (no errors)
- ✅ No unhandled exceptions
- ✅ No 404s or failed network requests
- ✅ No React errors
- ✅ No warnings (or only expected warnings)

### Failure Criteria:
- ❌ Any JavaScript errors in console
- ❌ Unhandled exceptions
- ❌ Network errors
- ❌ App instability

### Pass / Fail: ________

---

---

# SECTION 3: POWER CARDS TESTS (8 test cases)

## TC-CARDS-001: Shield Card Usage

**Test ID:** TC-CARDS-001  
**Component:** Power Cards / Card Usage  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game is loaded
- Shield card is in player's hand (shows 3 cards initially)

### Test Steps:
1. Click on Shield power card
2. Wait 1 second
3. Observe card state and game state

### Expected Results:
- ✅ Shield card click is registered
- ✅ Card is removed from hand
- ✅ Card count decrements (3 → 2)
- ✅ Visual feedback confirms card usage
- ✅ Shield effect applies (next capture blocked or damage reduced)
- ✅ No errors in console

### Failure Criteria:
- ❌ Card click does nothing
- ❌ Card is not consumed
- ❌ Card count doesn't change
- ❌ No effect applies
- ❌ **BUG #2 - Power cards broken**

### Pass / Fail: ________

---

## TC-CARDS-002: Freeze Card Usage

**Test ID:** TC-CARDS-002  
**Component:** Power Cards / Card Usage  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game in progress
- Freeze card is in player's hand

### Test Steps:
1. Click on Freeze power card
2. Wait 1 second
3. Observe effect on opponent's next turn

### Expected Results:
- ✅ Card is consumed
- ✅ Card count decrements
- ✅ Freeze effect applies (opponent cannot move on next turn, or movement restricted)
- ✅ Visual/game feedback confirms effect
- ✅ After freeze ends, opponent can move normally

### Failure Criteria:
- ❌ Card does not work
- ❌ Effect does not apply
- ❌ Card is not consumed

### Pass / Fail: ________

---

## TC-CARDS-003: Extra Move Card Usage

**Test ID:** TC-CARDS-003  
**Component:** Power Cards / Card Usage  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game in progress
- Extra Move card is in player's hand

### Test Steps:
1. Click on Extra Move power card
2. Wait 1 second
3. Try to make another move

### Expected Results:
- ✅ Card is consumed
- ✅ Card count decrements
- ✅ Player gets extra move (can move twice instead of once)
- ✅ After extra move, turn returns to opponent
- ✅ Effect is clear to player

### Failure Criteria:
- ❌ Card does not work
- ❌ Extra move is not granted
- ❌ Card is not consumed

### Pass / Fail: ________

---

## TC-CARDS-004: Card Depletion

**Test ID:** TC-CARDS-004  
**Component:** Power Cards / Card Management  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Local game in progress
- Player has used 2 of 3 cards

### Test Steps:
1. Observe card count in panel (should show 1)
2. Use the last card
3. Observe card count (should show 0)
4. Try to use another card (should not be available)

### Expected Results:
- ✅ Card count shows 3 initially
- ✅ Count decrements with each use: 3 → 2 → 1 → 0
- ✅ When count is 0, no more cards can be used
- ✅ Depleted cards are not clickable or visually grayed out
- ✅ Cards cannot be used twice

### Failure Criteria:
- ❌ Cards persist after use
- ❌ Count doesn't decrement
- ❌ Can use more than 3 cards
- ❌ **BUG #2 - Cards not depleted**

### Pass / Fail: ________

---

## TC-CARDS-005: Card Effect Verification - Shield

**Test ID:** TC-CARDS-005  
**Component:** Card Effects / Game Logic  
**Severity:** HIGH  
**Test Type:** Functional

### Prerequisites:
- Local game with Shield card active
- Shield effect has been applied

### Test Steps:
1. After using Shield, opponent attempts capture
2. Observe if capture is blocked or damage is reduced
3. Verify effect behavior

### Expected Results:
- ✅ Shield blocks next capture, OR
- ✅ Shield reduces damage from capture, OR
- ✅ Clear game mechanic shows effect applied
- ✅ Effect expires after being used (next capture is normal)

### Failure Criteria:
- ❌ Effect does not apply
- ❌ Capture happens normally despite Shield
- ❌ No difference in gameplay

### Pass / Fail: ________

---

## TC-CARDS-006: Card Effect Verification - Freeze

**Test ID:** TC-CARDS-006  
**Component:** Card Effects / Game Logic  
**Severity:** HIGH  
**Test Type:** Functional

### Prerequisites:
- Local game with Freeze card active
- Freeze has been applied to opponent

### Test Steps:
1. After using Freeze, wait for opponent's turn
2. Try to click opponent's piece (should not work)
3. Observe if opponent is frozen

### Expected Results:
- ✅ Opponent cannot move (frozen for 1 turn)
- ✅ Turn automatically passes to next player
- ✅ After frozen turn ends, opponent can move normally
- ✅ Game state reflects frozen status

### Failure Criteria:
- ❌ Opponent can still move
- ❌ Effect does not apply
- ❌ Game hangs or crashes

### Pass / Fail: ________

---

## TC-CARDS-007: Card Effect Verification - Extra Move

**Test ID:** TC-CARDS-007  
**Component:** Card Effects / Game Logic  
**Severity:** HIGH  
**Test Type:** Functional

### Prerequisites:
- Local game with Extra Move card active
- Extra Move has been applied

### Test Steps:
1. After using Extra Move, player makes first move
2. Observe if player can move again
3. Make second move
4. Verify turn switches to opponent

### Expected Results:
- ✅ After first move, board is still player's turn
- ✅ Can click and move another piece
- ✅ After second move, turn switches to opponent
- ✅ Opponent only gets one move

### Failure Criteria:
- ❌ Extra move is not granted
- ❌ Cannot make second move
- ❌ Turn switches after first move

### Pass / Fail: ________

---

## TC-CARDS-008: Console Errors - Cards

**Test ID:** TC-CARDS-008  
**Component:** Error Handling / Console  
**Severity:** HIGH  
**Test Type:** Error Handling

### Prerequisites:
- All card tests completed (TC-CARDS-001 through TC-CARDS-007)

### Test Steps:
1. Review browser console
2. Look for any errors related to card usage
3. Note any issues

### Expected Results:
- ✅ No console errors when using cards
- ✅ No unhandled exceptions
- ✅ No network errors for card API calls

### Failure Criteria:
- ❌ Console errors when using cards
- ❌ Failed API calls
- ❌ Unhandled exceptions

### Pass / Fail: ________

---

---

# SECTION 4: ONLINE GAME TESTS (6 test cases)

## TC-ONLINE-001: Create Room

**Test ID:** TC-ONLINE-001  
**Component:** Room Creation / Lobby  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- User is logged in
- User is on lobby page
- Browser console is open

### Test Steps:
1. Click "Create Room" button
2. Wait 2 seconds for response
3. Observe room creation response

### Expected Results:
- ✅ POST request sent to `/api/games`
- ✅ Backend returns 201 Created with room data
- ✅ Room code is displayed to user
- ✅ Room code is unique and shareable
- ✅ User is added as host (white player)
- ✅ User can see room details
- ✅ No errors in console

### Failure Criteria:
- ❌ Button does nothing
- ❌ No API call made
- ❌ No room code displayed
- ❌ API error (4xx or 5xx)
- ❌ **BUG #4 - Create room broken**

### Pass / Fail: ________

---

## TC-ONLINE-002: Room Code Display

**Test ID:** TC-ONLINE-002  
**Component:** Lobby / Room Code  
**Severity:** HIGH  
**Test Type:** Visual

### Prerequisites:
- Room has been created (from TC-ONLINE-001)

### Test Steps:
1. Observe room code display
2. Verify room code is:
   - Visible and readable
   - Copyable (can copy to clipboard)
   - Shareable with another player

### Expected Results:
- ✅ Room code is displayed prominently
- ✅ Code format is valid (alphanumeric, appropriate length)
- ✅ Can copy code to clipboard
- ✅ Code is unique for this room

### Failure Criteria:
- ❌ Code is not displayed
- ❌ Code is unclear or hard to read
- ❌ Cannot copy code

### Pass / Fail: ________

---

## TC-ONLINE-003: Join Room

**Test ID:** TC-ONLINE-003  
**Component:** Room Joining / Lobby  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Room exists and room code is known (from TC-ONLINE-001)
- Second user/browser is logged in
- Second user is on lobby page

### Test Steps:
1. Click "Join Room" button
2. Enter room code from TC-ONLINE-001
3. Click "Join" or "Submit"
4. Wait 2 seconds for response
5. Observe join response

### Expected Results:
- ✅ Join dialog/form appears
- ✅ Can enter room code
- ✅ POST request sent to `/api/games/join`
- ✅ Backend validates room code
- ✅ Backend adds player as guest (black player)
- ✅ Both players are added to same game
- ✅ No errors in console

### Failure Criteria:
- ❌ Join button does nothing
- ❌ No dialog appears
- ❌ Cannot enter room code
- ❌ API error
- ❌ Cannot join valid room
- ❌ **BUG #7 - Join room broken**

### Pass / Fail: ________

---

## TC-ONLINE-004: Game Start with Two Players

**Test ID:** TC-ONLINE-004  
**Component:** Online Game / Game Initialization  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Two players have joined same room (from TC-ONLINE-003)
- Both players are viewing game board

### Test Steps:
1. Host player (white) makes first move
2. Observe if guest player (black) sees move in real-time
3. Guest player makes response move
4. Observe if host player sees move in real-time

### Expected Results:
- ✅ Game board loads for both players
- ✅ Moves are synchronized in real-time (±1 second)
- ✅ Both players see same board state
- ✅ Move history is synchronized
- ✅ Captures are visible to both players
- ✅ Turn indication is clear for both

### Failure Criteria:
- ❌ Moves are not synchronized
- ❌ Players see different board states
- ❌ Real-time updates do not work
- ❌ WebSocket connection fails

### Pass / Fail: ________

---

## TC-ONLINE-005: Invalid Room Code

**Test ID:** TC-ONLINE-005  
**Component:** Room Joining / Error Handling  
**Severity:** HIGH  
**Test Type:** Error Handling

### Prerequisites:
- User is on lobby page and attempting to join room

### Test Steps:
1. Click "Join Room" button
2. Enter invalid room code: `INVALID123`
3. Click "Join"
4. Wait for response

### Expected Results:
- ✅ API request is sent
- ✅ Backend returns 404 Not Found (room doesn't exist)
- ✅ User-friendly error message is displayed
- ✅ User can try again with correct code
- ✅ No crashes or console errors

### Failure Criteria:
- ❌ No error message shown
- ❌ User is confused
- ❌ App crashes
- ❌ Cannot retry

### Pass / Fail: ________

---

## TC-ONLINE-006: Console Errors - Online Game

**Test ID:** TC-ONLINE-006  
**Component:** Error Handling / Console  
**Severity:** HIGH  
**Test Type:** Error Handling

### Prerequisites:
- Completed all online game tests (TC-ONLINE-001 through TC-ONLINE-005)

### Test Steps:
1. Review browser console for both players
2. Look for any JavaScript errors
3. Look for WebSocket errors
4. Note any issues

### Expected Results:
- ✅ Console is clean (no errors)
- ✅ No WebSocket errors
- ✅ No network request failures
- ✅ Real-time sync is stable

### Failure Criteria:
- ❌ Console errors
- ❌ WebSocket disconnections
- ❌ Network errors

### Pass / Fail: ________

---

---

# SECTION 5: COMPUTER GAME TESTS (2 test cases)

## TC-COMPUTER-001: Launch Computer Game

**Test ID:** TC-COMPUTER-001  
**Component:** Computer Game Mode / AI  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- User is on homepage
- Browser console is open

### Test Steps:
1. Click "Play vs Computer" button
2. Wait 3 seconds for game to load
3. Observe game board

### Expected Results:
- ✅ Page loads without crashing
- ✅ Game board displays
- ✅ Pieces are in starting positions
- ✅ Player is white (plays first)
- ✅ Computer is black
- ✅ Game is playable (can click pieces)
- ✅ No errors in console

### Failure Criteria:
- ❌ Page crashes or goes blank
- ❌ 500 server error
- ❌ Cannot load game
- ❌ Cannot interact with board
- ❌ **BUG #8 - Computer mode crashes**

### Pass / Fail: ________

---

## TC-COMPUTER-002: Computer Move Response

**Test ID:** TC-COMPUTER-002  
**Component:** AI / Move Generation  
**Severity:** CRITICAL  
**Test Type:** Functional

### Prerequisites:
- Computer game is loaded (from TC-COMPUTER-001)

### Test Steps:
1. Make first move as white (e.g., e2-e4)
2. Wait for computer response (max 3 seconds)
3. Observe if computer makes a move
4. Verify move is legal

### Expected Results:
- ✅ Computer responds with move within 3 seconds
- ✅ Computer move is legal and valid
- ✅ Board updates with computer's move
- ✅ Turn switches back to player
- ✅ Player can make next move
- ✅ Game flow is smooth

### Failure Criteria:
- ❌ Computer does not respond
- ❌ Game hangs indefinitely
- ❌ Illegal move made by computer
- ❌ App crashes
- ❌ Cannot continue playing

### Pass / Fail: ________

---

---

# SECTION 6: INTEGRATION & SYSTEM TESTS (2 test cases)

## TC-SYSTEM-001: App Stability

**Test ID:** TC-SYSTEM-001  
**Component:** Overall System / Error Handling  
**Severity:** CRITICAL  
**Test Type:** System

### Prerequisites:
- All previous tests have been executed
- Application has been heavily used

### Test Steps:
1. Review browser console for entire session
2. Look for memory leaks (console should not show growing errors)
3. Verify no unhandled exceptions
4. Test rapid navigation between pages
5. Test rapid game switches (local → online → computer → local)

### Expected Results:
- ✅ No memory leaks
- ✅ No cumulative errors
- ✅ App remains stable throughout session
- ✅ Navigation is smooth
- ✅ Game switches are seamless

### Failure Criteria:
- ❌ Memory leaks detected
- ❌ App slows down over time
- ❌ Unhandled exceptions accumulate
- ❌ Navigation failures
- ❌ App crashes

### Pass / Fail: ________

---

## TC-SYSTEM-002: Network Resilience

**Test ID:** TC-SYSTEM-002  
**Component:** API / Network / Error Handling  
**Severity:** HIGH  
**Test Type:** System

### Prerequisites:
- Backend server is running
- Network tab is monitored

### Test Steps:
1. Monitor all API calls made during gameplay
2. Verify all requests return proper responses
3. Verify error responses are handled gracefully
4. Test with slow network (check if timeouts are handled)

### Expected Results:
- ✅ All API calls are successful (2xx responses)
- ✅ No 4xx or 5xx errors (except intentional test cases)
- ✅ Network timeouts are handled gracefully
- ✅ Error messages are user-friendly
- ✅ Retry mechanisms work if present

### Failure Criteria:
- ❌ Unhandled API errors
- ❌ Cryptic error messages
- ❌ App crashes on network issues
- ❌ No error handling

### Pass / Fail: ________

---

---

# TEST SUMMARY SHEET

## Critical Path (Must Pass All):
- [ ] TC-AUTH-001: Registration
- [ ] TC-AUTH-002: Login
- [ ] TC-LOCAL-001: Game Initialization
- [ ] TC-LOCAL-003: Black Piece Colors
- [ ] TC-LOCAL-004: Piece Selection
- [ ] TC-LOCAL-005: Piece Movement
- [ ] TC-LOCAL-008: White Captured
- [ ] TC-LOCAL-011: Timer
- [ ] TC-CARDS-001: Shield Card
- [ ] TC-ONLINE-001: Create Room
- [ ] TC-ONLINE-003: Join Room
- [ ] TC-COMPUTER-001: Computer Game Load

## Full Suite (48 test cases):
Total Passed: ____/48  
Total Failed: ____/48  
Pass Rate: _____%

---

## EXECUTION NOTES:

**Start Time:** 10:00 PM UTC  
**Expected End Time:** 10:30 PM UTC  
**Actual End Time:** ____________  
**Total Duration:** ____________  

**Critical Issues Found:**
```
[Space for documenting critical issues]
```

**Non-Critical Issues Found:**
```
[Space for documenting non-critical issues]
```

**Tester Signature:** Daniel (QA)  
**Date:** May 17, 2026  
**Status:** ☐ PASS / ☐ FAIL

---

