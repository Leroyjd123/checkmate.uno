# Phase 3 Integration Verification Checklist

**Date:** May 16, 2026  
**Full Stack Agent:** Monitoring Phase 3 Execution  
**Status:** Active

---

## ✅ Database Setup

- [ ] Prisma 6 installed (`@prisma/client@6` and `prisma@6`)
  - Expected: `npm list @prisma/client` shows version 6.x.x
  - Expected: `npm list prisma` shows version 6.x.x

- [ ] Prisma client generated successfully
  - Expected: Directory exists: `backend/src/generated/prisma/client/`
  - Expected: File exists: `backend/src/generated/prisma/client/index.d.ts`
  - Expected: No errors during `npx prisma generate`

- [ ] All 4 tables created in Supabase PostgreSQL
  - Expected tables:
    - `users` (id, email, password_hash, created_at, updated_at)
    - `games` (id, host_id, opponent_id, mode, status, room_code, board_state, current_turn, created_at, updated_at)
    - `game_cards` (id, game_id, player_id, card_type, status, used_at, created_at)
    - `moves` (id, game_id, player_id, from_square, to_square, created_at)

- [ ] All indexes created
  - `users.email` UNIQUE
  - `games.room_code` UNIQUE
  - `games.status` indexed
  - `game_cards.game_id` indexed
  - `moves.game_id` indexed

- [ ] Seed data populated
  - Expected: 3 test users (alice@example.com, bob@example.com, charlie@example.com)
  - Expected: 3 test games (1 local, 1 online waiting, 1 completed)
  - Expected: 6 power cards distributed to games
  - Verification: Can query via `npx prisma studio`

---

## ✅ Backend Server

- [ ] Backend starts without errors
  - Command: `cd backend && npm run start:dev`
  - Expected: "NestJS application successfully started" in logs
  - Expected: "Connected to database" in logs
  - Expected: "WebSocket gateway listening on port 3000" in logs
  - Expected: Listening on `http://localhost:3000`

- [ ] Health check passes
  - Command: `curl http://localhost:3000/api/health`
  - Expected response: HTTP 200 OK
  - Expected body: `{"status":"ok"}`

- [ ] Database connection confirmed
  - Expected: No "connection refused" errors in logs
  - Expected: No "Cannot find module '@prisma/client'" errors
  - Expected: No "spawn prisma-client ENOENT" errors

- [ ] No TypeScript compilation errors
  - Command: `npm run build` in backend directory
  - Expected: Successful build with no errors
  - Expected: `dist/` directory created with compiled files

---

## ✅ API Integration Tests (5 Core Endpoints)

### Test 1: User Registration ✓
- [ ] Endpoint: `POST /api/auth/register`
- [ ] Request:
  ```json
  {
    "email": "integration-test@test.com",
    "password": "TestPass123!"
  }
  ```
- [ ] Expected Response: HTTP 201 Created
  ```json
  {
    "accessToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "integration-test@test.com"
    }
  }
  ```
- [ ] Verification: User record created in database

### Test 2: User Login ✓
- [ ] Endpoint: `POST /api/auth/login`
- [ ] Request:
  ```json
  {
    "email": "alice@example.com",
    "password": "alice123"
  }
  ```
- [ ] Expected Response: HTTP 200 OK with valid JWT token
- [ ] Token Format: Bearer token valid for API calls
- [ ] Verification: Token decoded shows correct user ID

### Test 3: Game Creation ✓
- [ ] Endpoint: `POST /api/games` (authenticated)
- [ ] Headers: `Authorization: Bearer <token from Test 2>`
- [ ] Request:
  ```json
  {
    "mode": "local"
  }
  ```
- [ ] Expected Response: HTTP 201 Created
  ```json
  {
    "id": "game-uuid",
    "mode": "local",
    "host_id": "user-uuid",
    "board_state": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "current_turn": "white",
    "status": "active",
    "created_at": "2026-05-16T..."
  }
  ```
- [ ] Verification: Game record created in database

### Test 4: Game State Fetch ✓
- [ ] Endpoint: `GET /api/games/:id` (authenticated)
- [ ] Headers: `Authorization: Bearer <token>`
- [ ] Path: Use game ID from Test 3
- [ ] Expected Response: HTTP 200 OK
  ```json
  {
    "id": "game-uuid",
    "board_state": "...",
    "current_turn": "white",
    "cards": [...],
    "moves": [...],
    "active_effects": []
  }
  ```
- [ ] Verification: Returns complete game state

### Test 5: Move Execution ✓
- [ ] Endpoint: `POST /api/games/:id/move` (authenticated)
- [ ] Headers: `Authorization: Bearer <token>`
- [ ] Request:
  ```json
  {
    "from": "e2",
    "to": "e4"
  }
  ```
- [ ] Expected Response: HTTP 200 OK
  ```json
  {
    "success": true,
    "boardState": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    "currentTurn": "black"
  }
  ```
- [ ] Verification: Move persisted to database

---

## ✅ WebSocket Gateway

- [ ] Gateway running on port 3000
  - Expected: Socket.io listening
  - Expected: No CORS errors in logs

- [ ] CORS configured correctly
  - Expected: Clients from http://localhost:3001 accepted
  - Expected: No "blocked by CORS" errors

- [ ] Clients can connect
  - Test: Open browser console at http://localhost:3001 and check for socket connection
  - Expected: `socket.io.js` loaded
  - Expected: No WebSocket connection errors

- [ ] Events broadcast correctly
  - Expected: `move_made` event broadcasts to room
  - Expected: `game_over` event broadcasts to room
  - Expected: `card_used` event broadcasts to room

---

## ✅ Frontend Preparation

- [ ] Frontend build succeeds
  - Command: `cd frontend && npm run build`
  - Expected: Build completes without errors
  - Expected: `.next/` directory created

- [ ] TypeScript compilation passes
  - Command: `npm run type-check` (if available) or `tsc --noEmit`
  - Expected: Zero type errors

- [ ] GameContext updated for API calls
  - Expected: `executeMove()` function exists and calls API
  - Expected: `useCard()` function exists and calls API
  - Expected: Optimistic update pattern implemented
  - Expected: Revert logic on API error

- [ ] Game pages ready for API integration
  - File: `frontend/src/app/game/[gameId]/page.tsx`
  - Expected: Fetches game state from API on load
  - Expected: Sends moves to API
  - Expected: Sends cards to API
  - Expected: Joins WebSocket room

- [ ] Error handling present
  - Expected: Try/catch on all API calls
  - Expected: Error messages displayed to user
  - Expected: Loading states shown during API calls

- [ ] No `any` types in code
  - Command: `grep -r " any" src/`
  - Expected: Zero results (strict TypeScript)

---

## ✅ Documentation Complete

- [ ] README_PHASE_3_BLOCKERS.md
  - Status: ✅ Completed in previous conversation
  - Purpose: Documents all blockers and solutions

- [ ] PHASE_3_QUICKSTART.md
  - Status: Required from backend team
  - Purpose: Quick reference for Phase 3 setup

- [ ] API_INTEGRATION_PLAN.md
  - Status: Required from frontend team
  - Purpose: Documents all endpoints to integrate

- [ ] PHASE_4_TESTING_PLAN.md
  - Status: Required from frontend team
  - Purpose: Test scenarios for Phase 4

---

## ✅ Code Quality & Rules Compliance

### Backend Checklist
- [ ] All endpoints have `@UseGuards(JwtAuthGuard)` if authenticated
- [ ] All DTOs validated with `class-validator` decorators
- [ ] Multi-step operations wrapped in `prisma.$transaction()`
- [ ] No `console.log()` with sensitive data (passwords, tokens, emails)
- [ ] Power card effects modify only `active_effects` JSONB
- [ ] All error responses use consistent format
- [ ] Zero `any` types in TypeScript
- [ ] Code follows `checkmate-uno-ai-rules.md`

### Frontend Checklist
- [ ] Server authority enforced (backend validates all game logic)
- [ ] Optimistic updates with revert pattern
- [ ] Game state in GameContext, never component local state
- [ ] Zero `any` types in TypeScript
- [ ] WebSocket only for broadcasts, REST for state changes
- [ ] No sensitive data logged (tokens, emails, room codes)
- [ ] Error handling on all API calls
- [ ] Code follows `checkmate-uno-ai-rules.md`

---

## 📊 Phase 3 Timeline

| Task | Owner | Duration | Status |
|------|-------|----------|--------|
| Prisma 6 Downgrade | Backend | 5 min | ⏳ Pending |
| Database Migrations | Backend | 2 min | ⏳ Pending |
| Seed Test Data | Backend | 1 min | ⏳ Pending |
| Backend Server Start | Backend | 3 min | ⏳ Pending |
| Integration Tests | Backend | 15 min | ⏳ Pending |
| Code Review | Backend | Review | ⏳ Pending |
| API Integration Plan | Frontend | 30 min | ⏳ Pending |
| GameContext Update | Frontend | 1 hr | ⏳ Pending |
| Game Pages Update | Frontend | 1 hr | ⏳ Pending |
| Error Handling | Frontend | 45 min | ⏳ Pending |
| Testing Plan | Frontend | 30 min | ⏳ Pending |
| Code Review | Frontend | Review | ⏳ Pending |
| **Phase 3 Total** | **All** | **~45 min** | **⏳ In Progress** |

---

## 🎯 Success Definition

Phase 3 is **COMPLETE** when **ALL** of the following are true:

✅ Backend server running without errors  
✅ All 5 integration tests passing  
✅ Supabase has 4 tables with seed data  
✅ Frontend connects to API without CORS errors  
✅ WebSocket broadcasts working  
✅ Zero TypeScript errors (frontend & backend)  
✅ All code follows AI rules  
✅ Documentation complete and current  
✅ No console errors (browser or server)  
✅ Ready to proceed with Phase 4  

---

## 📋 How to Use This Checklist

**For Backend Agent:**
1. Execute tasks 1.1 → 1.6 in order
2. Check off items as they complete
3. Report status to Full Stack Agent

**For Frontend Agent:**
4. Execute tasks 2.1 → 2.6 in order
5. Check off items as they complete
6. Report status to Full Stack Agent

**For Full Stack Agent:**
7. Monitor both agents' progress
8. Verify all checklist items complete
9. Sign off when Phase 3 complete

---

## 📞 Escalation

If any task fails:
1. Report specific error to Full Stack Agent
2. Reference the checklist item that failed
3. Include error message and console output
4. Full Stack Agent coordinates resolution

---

**Created:** May 16, 2026  
**By:** Full Stack Agent  
**Status:** ✅ Ready for Phase 3 Execution  
**Next:** Await Backend Agent Task 1.1 completion
