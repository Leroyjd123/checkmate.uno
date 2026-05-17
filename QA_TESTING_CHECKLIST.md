# QA Testing Checklist - Checkmate.Uno
**Tester:** Daniel (QA Specialist)  
**Purpose:** Template for testing each bug fix  
**Last Updated:** May 17, 2026

---

## HOW TO USE THIS DOCUMENT

When a developer marks a bug as "🟢 READY_FOR_QA", I will:

1. Copy the relevant section below
2. Fill in the details
3. Test thoroughly
4. Mark PASS or FAIL with evidence
5. Update BUG_TRACKING.md with result

---

## TEMPLATE: BUG #1 - Player Movement

**Bug:** Local Game - Player 1 Cannot Move  
**Status:** 🔵 TESTING  
**Tester:** Daniel  
**Test Date:** [DATE]  
**Branch:** [DEV-BRANCH-NAME]  
**Commit:** [COMMIT-HASH]

### Pre-Test Checklist
- [ ] Code pulled to local machine
- [ ] Frontend rebuilt: `npm run build`
- [ ] Dev server started: `npm run dev`
- [ ] Browser at http://localhost:3000 ready
- [ ] Browser console (F12) open for error checking

### Reproduction Test
**Objective:** Verify Player 1 can select and move white pieces

**Test Case 1.1: Player 1 (White) Piece Selection**
- [ ] Navigate to http://localhost:3000/game/local
- [ ] Game loads, white to play first
- [ ] Click on white pawn at e2
- [ ] Expected: Piece highlights yellow
- [ ] Expected: Legal move squares highlight green (e3, e4)
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.2: Player 1 (White) Move Execution**
- [ ] Click legal move square (e4)
- [ ] Expected: White pawn moves to e4
- [ ] Expected: Board updates visually
- [ ] Expected: Turn switches to black
- [ ] Expected: Status bar shows "● Black's Turn"
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.3: Player 2 (Black) Piece Selection**
- [ ] Now it's black's turn
- [ ] Click on black pawn at e7
- [ ] Expected: Piece highlights yellow
- [ ] Expected: Legal moves show (e6, e5)
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.4: Turn Alternation**
- [ ] Click black pawn move (e5)
- [ ] Expected: Pawn moves to e5
- [ ] Expected: Board updates
- [ ] Expected: Turn switches back to white
- [ ] Expected: Status bar shows "● White's Turn"
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.5: Piece Color Validation**
- [ ] Player 1 (white's turn) tries to click black piece
- [ ] Expected: Black piece does NOT get selected
- [ ] Expected: No legal moves show for black piece
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.6: 10-Move Game**
- [ ] Play 10-15 moves total with both players
- [ ] Expected: Both players can move freely
- [ ] Expected: No errors in console (F12)
- [ ] Expected: Board state accurate after each move
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Regression Testing
**Objective:** Verify fix doesn't break other systems

**Test Case 1.7: Online Game (Still Works)**
- [ ] If online game code exists, test that auth can work
- [ ] Expected: Host assigned white, guest assigned black
- [ ] Expected: Color assignment still correct
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 1.8: Console Errors**
- [ ] Open browser DevTools (F12)
- [ ] Play game for 10 moves
- [ ] Check Console tab
- [ ] Expected: NO red errors
- [ ] Expected: NO warnings about piece selection
- [ ] Actual errors: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Summary

**All Tests Passed?** ☐ YES ☐ NO

**Final Result:** 
- ✅ VERIFIED - Fix works completely, no regressions
- ❌ FAILED - Issue remains or new issues found
- ⚠️ PARTIAL - Some tests pass, some fail

**Detailed Findings:**
```
[Paste any specific failures, error messages, unexpected behavior]
```

**Evidence:**
- Screenshots: [Attach if showing broken UI]
- Console errors: [Copy any error messages]
- Video: [Link to recording if complex issue]

**Next Steps:**
- [ ] If VERIFIED: Move bug to ✅ CLOSED in BUG_TRACKING.md
- [ ] If FAILED: Return to developer with specific failures

**Tester Sign-Off:**
- Tested by: Daniel
- Date: [DATE]
- Time spent: [MINUTES]
- Confidence level: [LOW/MEDIUM/HIGH]

---

## TEMPLATE: BUG #2 - Auth Flow

**Bug:** Auth Flow - Backend Not Responding  
**Status:** 🔵 TESTING  
**Tester:** Daniel  
**Test Date:** [DATE]  
**Branch:** [DEV-BRANCH-NAME]  
**Commit:** [COMMIT-HASH]

### Pre-Test Checklist
- [ ] Backend server running: `npm run start` (in /backend)
- [ ] Frontend running: `npm run dev` (in /frontend)
- [ ] Both servers on localhost:3000 (frontend) and 3001 (backend)
- [ ] Network tab in DevTools (F12) ready to check API calls
- [ ] Postman or curl ready for direct API testing

### Database Check
**Test Case 2.1: Database Connection**
- [ ] Check backend logs for database connection status
- [ ] Expected: "Database connected" or similar
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Registration Flow

**Test Case 2.2: Register New User**
- [ ] Navigate to http://localhost:3000/auth/register
- [ ] Enter email: testuser1@example.com
- [ ] Enter password: TestPassword123!
- [ ] Click "Register"
- [ ] Expected: Redirect to homepage
- [ ] Expected: User logged in (see user info in UI if present)
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.3: Duplicate Email Prevention**
- [ ] Try registering with same email again: testuser1@example.com
- [ ] Expected: Error message "Email already registered" (400 error)
- [ ] Expected: Stay on register page
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.4: Password Validation**
- [ ] Try registering with weak password: "123"
- [ ] Expected: Error message about password requirements
- [ ] Expected: Registration rejected
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Login Flow

**Test Case 2.5: Login With Correct Credentials**
- [ ] Navigate to http://localhost:3000/auth/login
- [ ] Enter email: testuser1@example.com
- [ ] Enter password: TestPassword123!
- [ ] Click "Login"
- [ ] Expected: Redirect to homepage
- [ ] Expected: User is logged in
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.6: Login With Wrong Password**
- [ ] Navigate to http://localhost:3000/auth/login
- [ ] Enter email: testuser1@example.com
- [ ] Enter password: WrongPassword123!
- [ ] Click "Login"
- [ ] Expected: Error message "Invalid credentials" (401 error)
- [ ] Expected: Stay on login page
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.7: Login With Non-Existent Email**
- [ ] Enter email: nonexistent@example.com
- [ ] Enter password: SomePassword123!
- [ ] Expected: Error message "User not found" (401 error)
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Session Persistence

**Test Case 2.8: Token Persists Across Refresh**
- [ ] Login with testuser1@example.com
- [ ] Refresh page (F5)
- [ ] Expected: Still logged in, no redirect to login
- [ ] Expected: User info visible
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.9: /api/auth/me Endpoint**
- [ ] After login, test direct API call
- [ ] ```bash
     curl -b "auth_token=[TOKEN]" http://localhost:3001/api/auth/me
     ```
- [ ] Expected: Returns { user: { id, email, theme_preference } }
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Logout Flow

**Test Case 2.10: Logout Clears Session**
- [ ] Click Logout button (if available)
- [ ] Expected: Redirect to login page
- [ ] Expected: Token cookie cleared
- [ ] Expected: Cannot access protected pages
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Error Handling

**Test Case 2.11: Network Error Handling**
- [ ] Stop backend server
- [ ] Try to login
- [ ] Expected: Clear error message (timeout or connection refused)
- [ ] Expected: Helpful message to user
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 2.12: Console Errors**
- [ ] Open DevTools Console (F12)
- [ ] Play through login/register/logout flow
- [ ] Expected: NO red errors
- [ ] Expected: NO 500 errors in Network tab
- [ ] Actual errors: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Summary

**All Tests Passed?** ☐ YES ☐ NO

**Final Result:**
- ✅ VERIFIED - Auth flow works completely
- ❌ FAILED - Auth issues remain
- ⚠️ PARTIAL - Some auth methods work

**Detailed Findings:**
```
[Paste any specific failures]
```

**Tester Sign-Off:**
- Tested by: Daniel
- Date: [DATE]
- Time spent: [MINUTES]
- Confidence level: [LOW/MEDIUM/HIGH]

---

## TEMPLATE: BUG #3 - Card System

**Bug:** Card Type Casting Error  
**Status:** 🔵 TESTING  
**Tester:** Daniel  
**Test Date:** [DATE]  
**Branch:** [DEV-BRANCH-NAME]

### Pre-Test Checklist
- [ ] BUG #1 fixed (piece movement working)
- [ ] Frontend running
- [ ] Game loads with 8 power cards
- [ ] Each card is clickable

### Card Click Tests

**Test Case 3.1: Shield Card**
- [ ] Start local game (BUG #1 fixed)
- [ ] Click Shield card
- [ ] Expected: Message "SHIELD card used!" appears for 2 seconds
- [ ] Expected: Card shows as used (grayed out)
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.2: Skip Turn Card**
- [ ] Use Skip Turn card
- [ ] Expected: Message "SKIP TURN card used!" appears
- [ ] Expected: Card marked as used
- [ ] Expected: (When implemented) Opponent's turn skipped
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.3: Extra Move Card**
- [ ] Use Extra Move card
- [ ] Expected: Message "EXTRA MOVE card used!" appears
- [ ] Expected: (When implemented) Player gets 2 moves next turn
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.4: Reverse Move Card**
- [ ] Use Reverse Move card
- [ ] Expected: Message appears
- [ ] Expected: (When implemented) Opponent's last move reverses
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.5: Teleport Card**
- [ ] Use Teleport card
- [ ] Expected: Message appears
- [ ] Expected: (When implemented) Piece moves to any square
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.6: Sacrifice Card**
- [ ] Use Sacrifice card
- [ ] Expected: Message appears
- [ ] Expected: (When implemented) Removes a piece for advantage
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.7: Wild Swap Card**
- [ ] Use Wild Swap card
- [ ] Expected: Message appears
- [ ] Expected: (When implemented) Swaps two pieces
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.8: Freeze Card**
- [ ] Use Freeze card
- [ ] Expected: Message appears
- [ ] Expected: (When implemented) Opponent piece frozen
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Card Behavior

**Test Case 3.9: Cards Only Available on Your Turn**
- [ ] Start game
- [ ] Try clicking card when it's opponent's turn
- [ ] Expected: Card button disabled (grayed out)
- [ ] Expected: Cannot click
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

**Test Case 3.10: Cards Mark as Used**
- [ ] Use multiple cards
- [ ] Expected: Each card shows ✓ after being used
- [ ] Expected: Used card button is disabled
- [ ] Expected: Can see card count increase in UI
- [ ] Actual: _______________

**Result:** ☐ PASS ☐ FAIL

---

### Summary

**All Tests Passed?** ☐ YES ☐ NO

**Final Result:**
- ✅ VERIFIED - Card system working
- ❌ FAILED - Card issues remain
- ⚠️ PARTIAL - Some cards work

**Tester Sign-Off:**
- Tested by: Daniel
- Date: [DATE]
- Confidence level: [LOW/MEDIUM/HIGH]

---

## NOTES FOR DEVELOPERS

When moving a bug to "Ready for QA":

1. **Create a clean branch** with your fix
2. **Include test reproduction steps** in the commit message
3. **Test your own fix** before marking ready
4. **Leave clear notes** on what you changed
5. **Be specific** about what should be tested

Example commit message:
```
fix(frontend): [BUG #1] Fix piece selection for local games

Changes:
- Updated playerColor assignment to check game.current_turn
- Removed hardcoded color restriction for local games
- Both players can now select and move their pieces

Testing:
- Run local game, move at least 10 pieces
- Verify both white and black can move
- Check console for errors

Fixes #1
```

---

*Maintained by Daniel (QA)*  
*Use this template for each bug fix*
