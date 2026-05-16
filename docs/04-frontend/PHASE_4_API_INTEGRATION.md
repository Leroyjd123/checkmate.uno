# Phase 4: Frontend API Integration Guide

## Status
Backend is running and ready for Phase 4 integration at `http://localhost:3000`

## Backend Ready Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Games
```
POST /api/games                  - Create a new game
GET /api/games/:id              - Get game state
POST /api/games/join            - Join a room (online mode)
POST /api/games/:id/move        - Execute a chess move
POST /api/games/:id/use-card    - Use a power card
```

## Task Breakdown for Phase 4 (Sam)

### Task 2.1: Update API Client (45 min)
- [ ] Verify endpoint URLs match backend (`localhost:3000/api`)
- [ ] Test connectivity to each endpoint
- [ ] Update environment variables if needed
- [ ] Create HTTP client with error handling

### Task 2.2: Wire GameContext to Real API (1.5 hours)
- [ ] Replace mock API calls with real endpoints
- [ ] Test createGame flow
- [ ] Test joinGame flow
- [ ] Test makeMove flow
- [ ] Test useCard flow
- [ ] Add loading states
- [ ] Add error handling/toast notifications

### Task 2.3: Implement WebSocket Sync (1.5 hours)
- [ ] Connect to Socket.io on `http://localhost:3000`
- [ ] Listen for opponent move events
- [ ] Handle real-time board updates
- [ ] Implement reconnection logic
- [ ] Handle connection errors gracefully

### Task 2.4-2.6: Testing & Code Review (2-3 hours)
- [ ] Run E2E test plan (23 scenarios)
- [ ] Test multiplayer (open in 2 browsers)
- [ ] Code review against AI rules
- [ ] Verify all 33 backend tests still passing

## Backend Test Status
✅ **All 33 tests passing**
- Games service: all tests passing
- Auth service: verified
- PostgreSQL integration: verified

## What's Working on Backend
- ✅ Game creation (offline and online modes)
- ✅ User authentication (register/login)
- ✅ Game state management
- ✅ Chess move validation
- ✅ Power card system
- ✅ Database persistence
- ✅ Transaction support

## Known Backend Details

### Game Creation Response
```json
{
  "game": {
    "id": "uuid",
    "mode": "offline|online",
    "status": "in_progress|waiting|completed",
    "board_state": "FEN string",
    "current_turn": "white|black",
    "room_code": "ABC123" // null for offline
  },
  "cards": [
    { "id": "uuid", "type": "skip_turn|reverse_move|..." }
  ]
}
```

### Game State Response
```json
{
  "id": "uuid",
  "mode": "offline|online",
  "status": "in_progress|waiting|completed",
  "board_state": "FEN string",
  "current_turn": "white|black",
  "active_effects": [],
  "your_cards": [
    { "id": "uuid", "type": "card_type" }
  ],
  "opponent_card_count": 4
}
```

### Error Handling
All endpoints return HTTP error codes:
- 400: Bad request / validation error
- 404: Game not found
- 401: Unauthorized (missing/invalid token)

## Next Steps
1. Start Task 2.1: API Client verification
2. Test each endpoint manually before integration
3. Wire up GameContext step by step
4. Monitor backend console for errors

Backend support is ready. Ping if you hit integration issues!
