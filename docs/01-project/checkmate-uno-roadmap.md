# Checkmate.Uno — Development Roadmap

## Document Metadata

**Product:** Checkmate.Uno  
**Version:** v1.0  
**Last Updated:** May 16, 2026  
**Owner:** Product & Engineering Team  

---

## Executive Summary

Checkmate.Uno is a chess variant game combining traditional chess with 8 power cards. Development follows a 4-phase approach: Foundation → Core Game → Multiplayer → Polish & Launch. Total estimated timeline: 8-10 weeks for MVP.

**Key Milestones:**
- Week 2: Core chess engine working
- Week 4: Power cards functional
- Week 6: Online multiplayer live
- Week 8-10: Polish, testing, launch

---

## Phase 1: Foundation & Infrastructure (Weeks 1-2) (✅ COMPLETE)

### Week 1: Project Setup & Database

**Backend Tasks:**
- Initialize NestJS project with TypeScript
- Set up Supabase project (database + auth)
- Create Prisma schema: `games`, `game_cards`, `moves`, `users` tables
- Run migrations
- Implement auth module (register, login endpoints)
- Set up JWT strategy and guards
- Configure environment variables

**Frontend Tasks:**
- Initialize Next.js 15 project (App Router)
- Set up Tailwind CSS
- Create folder structure (app/, components/, contexts/, lib/)
- Implement AuthContext and auth pages (login/register)
- Create homepage with mode selection buttons

**Deliverable:**
- Users can register, log in
- Homepage displays with 3 mode buttons (non-functional yet)
- Database schema live in Supabase

**Testing:**
- Manual: Create account, log in, verify JWT stored
- Automated: Auth endpoint unit tests

---

### Week 2: Chess Engine Integration

**Backend Tasks:**
- Install and integrate chess.js library
- Create ChessService wrapper for chess.js
- Implement move validation logic
- Implement checkmate detection
- Create GamesController with POST /api/games, GET /api/games/:id endpoints
- Implement game creation logic (generate starting board state, create game record)

**Frontend Tasks:**
- Install chess.js library
- Create GameBoard component (8x8 grid)
- Create Piece component (SVG rendering)
- Implement piece positioning from FEN notation
- Create basic drag-and-drop or click-to-move interaction
- Implement legal move highlighting (client-side)
- Create GameContext for state management
- Connect board to backend (API calls for move execution)

**Deliverable:**
- Chess board renders with pieces in starting position
- Users can make moves (drag or click)
- Illegal moves blocked (client-side)
- Moves validated server-side
- Checkmate detected and displayed

**Testing:**
- Manual: Play full chess game to checkmate
- Automated: Move validation unit tests, checkmate detection tests

---

## Phase 2: Core Gameplay Features (Weeks 3-4) (✅ COMPLETE)

### Week 3: Power Cards System

**Backend Tasks:**
- Define power card types enum in database
- Implement card generation logic (8 random cards, assign 3+3)
- Create POST /api/games/:id/use-card endpoint
- Implement each card effect logic:
  - Skip Turn → set turn skip flag
  - Reverse Move → query last move, undo via chess.js
  - Extra Move → set extra move flag
  - Teleport → modify FEN directly
  - Shield → append to active_effects JSONB
  - Sacrifice → modify FEN to remove pawn
  - Wild Swap → modify FEN to swap pieces
  - Freeze → append to active_effects JSONB
- Implement active_effects expiration logic (decrement turnsRemaining after each move)

**Frontend Tasks:**
- Create PowerCard component
- Create CardHand component (displays 3 cards)
- Implement card click handlers
- Implement targeting mode for cards requiring targets (Shield, Freeze, Teleport, Wild Swap)
- Render active effect icons on pieces (shield, freeze)
- Update GameContext to track cards and active effects
- Connect card usage to backend API

**Deliverable:**
- All 8 power cards functional
- Cards display in player's hand
- Cards activate with visual feedback
- Shield and freeze icons show on pieces
- Card removed from hand after use

**Testing:**
- Manual: Test each card type in isolation and combination
- Automated: Card effect unit tests (each card type), integration tests (card + move combinations)

---

### Week 4: Local & Computer Modes

**Backend Tasks:**
- Implement VS Computer mode:
  - Create computer move generation logic (random legal move)
  - Create computer card usage logic (20% chance, random card)
  - Add delay simulation (500ms) for UX feel
- Add game mode validation (local games don't hit backend)

**Frontend Tasks:**
- Implement local mode:
  - Client-side only game state (no API calls)
  - Manual device pass UI
  - Turn indicator for both players
  - Show both players' cards (no hidden information)
- Implement VS Computer mode:
  - User plays White, computer plays Black
  - Computer moves trigger automatically after user's turn
  - Loading indicator during computer move
  - Hide computer's cards (opponent view)

**Deliverable:**
- Local 2-player mode fully functional
- VS Computer mode fully functional
- Both modes playable start-to-finish (checkmate detection works)

**Testing:**
- Manual: Complete full games in both modes
- Automated: Computer move generation tests, local mode state management tests

---

## Phase 3: Online Multiplayer & Integration (Weeks 5-6) (🎯 ACTIVE)

> **PR Review Note:** Before writing more backend integration tests, the developer must resolve the Jest ESM (`import.meta.url`) configuration issue affecting `games.service.spec.ts`.

### Week 5: WebSocket & Room System

**Backend Tasks:**
- Install and configure Socket.io
- Create GamesGateway (WebSocket gateway)
- Implement room join/leave handlers
- Implement POST /api/games/join endpoint (room code validation)
- Implement room code generation logic (6-char, collision detection)
- Emit WebSocket events: `opponent_joined`, `move_made`, `card_used`, `game_over`
- Handle player disconnect/reconnect logic

**Frontend Tasks:**
- Install socket.io-client
- Create WebSocketContext
- Create useWebSocket hook
- Implement lobby page (create room, join room UI)
- Implement room code display and copy button
- Implement waiting screen
- Connect WebSocket events to GameContext updates
- Implement real-time move and card sync

**Deliverable:**
- Users can create rooms, receive room codes
- Users can join rooms via code
- Both players see game start simultaneously
- Moves and card usage sync in real-time between players

**Testing:**
- Manual: Two users play full game online
- Automated: WebSocket event tests, room code generation tests

---

### Week 6: Online Multiplayer Polish

**Backend Tasks:**
- Implement opponent disconnect detection (timeout after 60s)
- Implement game forfeit on disconnect
- Add game state recovery on reconnect
- Optimize WebSocket room cleanup

**Frontend Tasks:**
- Implement disconnect/reconnect UI:
  - "Opponent disconnected, waiting for reconnection..." overlay
  - "Connection lost, attempting to reconnect..." message
- Implement auto-reconnect logic (Socket.io built-in)
- Fetch latest game state on reconnect (GET /api/games/:id)
- Add forfeit button for online games
- Handle edge cases (both players disconnect, game state desync)

**Deliverable:**
- Online multiplayer robust to network issues
- Players can reconnect mid-game without data loss
- Forfeit button works correctly

**Testing:**
- Manual: Disconnect/reconnect scenarios (airplane mode, kill server)
- Automated: Reconnection logic tests, forfeit tests

---

## Phase 4: UI/UX Polish & Launch Prep (Weeks 7-10)

### Week 7: Theme System & Visual Polish

**Backend Tasks:**
- Add `users.theme_preference` column to database
- Implement PATCH /api/users/me endpoint (update theme)

**Frontend Tasks:**
- Design 3 theme color schemes (Light, Dark, Neon)
- Implement ThemeContext
- Create ThemeSwitcher component
- Apply theme colors to board, pieces, cards, UI
- Store theme preference in localStorage
- Sync theme with backend for cross-device persistence
- Add piece movement animations (smooth transitions)
- Add card activation animations
- Add winner modal with animations (confetti, crown icon)

**Deliverable:**
- 3 fully functional themes
- Theme switches without page reload
- Theme persists across sessions
- Professional visual polish on all UI elements

**Testing:**
- Manual: Test theme switching in all screens
- Automated: Theme persistence tests, localStorage tests

---

### Week 8: Error Handling & Edge Cases

**Backend Tasks:**
- Add comprehensive error responses for all endpoints
- Implement request validation (DTOs, class-validator)
- Add error logging (Winston or Pino)
- Handle edge cases: room code collisions, simultaneous moves, invalid card targets

**Frontend Tasks:**
- Implement error toast notifications
- Add loading states for all async actions
- Implement error boundaries (React)
- Add retry buttons for failed API calls
- Handle all edge cases documented in FRD (invalid game ID, targeting mode stuck, etc.)
- Add client-side input validation (email, password, room code format)

**Deliverable:**
- All error scenarios gracefully handled
- User-friendly error messages
- No unhandled exceptions or infinite loading states

**Testing:**
- Manual: Test all error scenarios from FRD
- Automated: Error handling tests for all API endpoints

---

### Week 9: Testing & Bug Fixes

**Backend Tasks:**
- Write integration tests for full game flows (create → move → checkmate)
- Write unit tests for power card effects
- Write WebSocket event tests
- Load testing (100 concurrent games)

**Frontend Tasks:**
- Write component tests for GameBoard, PowerCard, Modal
- Write integration tests for full user flows
- E2E tests with Playwright:
  - Create account → play local game → checkmate
  - Create room → join room → play online game → checkmate
- Accessibility testing (keyboard navigation, screen readers)
- Cross-browser testing (Chrome, Safari, Firefox)
- Mobile responsive testing (iPhone, Android)

**Deliverable:**
- 70%+ code coverage
- All critical paths E2E tested
- Zero critical bugs

**Testing:**
- Manual: QA team full regression testing
- Automated: CI/CD pipeline with all tests

---

### Week 10: Performance Optimization & Launch

**Backend Tasks:**
- Add database indexes for frequently queried fields
- Optimize Prisma queries (reduce N+1 queries)
- Add caching for static data (card types, themes)
- Set up production environment (Railway/Render)
- Configure environment variables for production
- Set up monitoring (Sentry, LogRocket, or similar)

**Frontend Tasks:**
- Optimize React re-renders (React.memo, useMemo, useCallback)
- Add code splitting (dynamic imports for game page)
- Optimize image assets (compress SVGs)
- Add performance monitoring (Web Vitals)
- Set up production build (Vercel)
- Configure environment variables for production

**Deliverable:**
- Production deployment ready
- Page load <2s on 3G
- API response time <200ms (P95)
- WebSocket latency <500ms
- Monitoring and alerting configured

**Testing:**
- Manual: Smoke test on production URLs
- Automated: Load testing, performance benchmarks

---

## Launch Checklist

### Pre-Launch (1 Week Before)

- [ ] All tests passing (backend + frontend)
- [ ] Production databases provisioned and migrated
- [ ] Environment variables set in production
- [ ] SSL certificates configured
- [ ] Domain names configured (checkmate-uno.com, api.checkmate-uno.com)
- [ ] Monitoring and alerting configured
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (optional: Google Analytics, Plausible)
- [ ] Backup strategy configured (Supabase automated backups)

### Launch Day

- [ ] Deploy backend to production (Railway/Render)
- [ ] Deploy frontend to production (Vercel)
- [ ] Smoke test all features on production
- [ ] Monitor error rates for first 24 hours
- [ ] Post launch announcement (social media, Product Hunt, etc.)

### Post-Launch (Week 1)

- [ ] Monitor server logs for errors
- [ ] Track usage metrics (games created, completion rate)
- [ ] Collect user feedback (add feedback button in app)
- [ ] Fix any critical bugs discovered
- [ ] Plan first post-launch iteration based on feedback

---

## Post-MVP Roadmap (Future Iterations)

### Iteration 2 (Weeks 11-14): Advanced Features

- [ ] Add game replay feature (use moves table)
- [ ] Add game history for users (list of past games)
- [ ] Add move history display in game (list of moves taken)
- [ ] Add turn timer (optional, per-game setting)
- [ ] Add stalemate detection
- [ ] Add draw by agreement (mutual offer)

### Iteration 3 (Weeks 15-18): Social Features

- [ ] Add user profiles (win/loss record, favorite cards)
- [ ] Add friend system (add friends, challenge to game)
- [ ] Add in-game chat (text only)
- [ ] Add spectator mode (share game link, others can watch)
- [ ] Add leaderboard (most wins, win streaks)

### Iteration 4 (Weeks 19-22): Monetization & Expansion

- [ ] Add custom card packs (unlock new cards)
- [ ] Add premium themes (animated pieces, custom boards)
- [ ] Add tournament mode (bracket system)
- [ ] Add mobile native apps (iOS, Android via React Native)
- [ ] Add ELO rating system (ranked matchmaking)

---

## Risk Management

### High-Risk Items

| Risk | Impact | Mitigation |
|---|---|---|
| WebSocket scaling issues on free tier | High — online mode fails at >50 concurrent games | Load test early (Week 6), plan migration to paid tier if needed |
| Chess.js performance on complex boards | Medium — slow move generation for computer AI | Profile early (Week 4), consider lighter chess library if needed |
| Database write rate limits (Supabase free tier) | Medium — games fail to save moves | Monitor write rate (Week 9), optimize queries, upgrade tier if needed |
| Power card balance issues | Low — some cards too strong | Playtest extensively (Week 9), tweak turn durations or effects if needed |

### Contingency Plans

- **WebSocket scaling fails:** Fallback to long-polling (every 2s) for online mode (degraded but functional)
- **Database limits hit:** Upgrade to Supabase Pro ($25/month) — allocate budget in advance
- **Chess.js too slow:** Replace with custom lightweight engine (only standard rules, no advanced features)

---

## Team Allocation (Suggested)

### Backend Developer (1 FTE)
- Weeks 1-2: Infrastructure, auth, chess engine
- Weeks 3-4: Power cards, computer AI
- Weeks 5-6: WebSockets, room system
- Weeks 7-10: Polish, testing, deployment

### Frontend Developer (1 FTE)
- Weeks 1-2: Project setup, auth UI, board rendering
- Weeks 3-4: Power cards UI, local/computer modes
- Weeks 5-6: Online multiplayer UI, WebSocket integration
- Weeks 7-10: Themes, polish, testing

### Designer (0.25 FTE — Part-Time)
- Weeks 1-3: Design themes, piece SVGs, card designs
- Weeks 7-8: Visual polish review, animation design

### QA Tester (0.5 FTE — Part-Time)
- Weeks 8-10: Full regression testing, bug reporting

**Total Team Size:** 2.75 FTE  
**Total Timeline:** 10 weeks  

---

## Success Metrics (Re-Stated from PRD)

**Track Weekly Post-Launch:**

| Metric | Week 1 Target | Week 4 Target | Week 12 Target |
|---|---|---|---|
| Games Completed | 100+ | 500+ | 2,000+ |
| Registered Users | 200+ | 1,000+ | 5,000+ |
| Return Rate (3+ games) | 20% | 30% | 40% |
| Avg Game Duration | 10-15 min | 8-15 min | 8-12 min |
| Room Code Shares | 20+ | 100+ | 500+ |

**Technical Metrics:**
- API P95 latency: <200ms (monitor via New Relic/Datadog)
- WebSocket message latency: <500ms (monitor via custom instrumentation)
- Error rate: <1% of API requests (monitor via Sentry)
- Uptime: >99% (monitor via UptimeRobot)

---

## Versioning Strategy

### Version Numbering

- **Major (X.0.0):** Breaking changes, major new features (e.g., tournament mode, mobile app)
- **Minor (0.X.0):** New features, non-breaking changes (e.g., new power cards, themes)
- **Patch (0.0.X):** Bug fixes, minor tweaks

### Release Cadence

- **MVP Launch:** v1.0.0 (Week 10)
- **Post-Launch Patches:** v1.0.1, v1.0.2, etc. (as needed for bugs)
- **Iteration 2:** v1.1.0 (Week 14)
- **Iteration 3:** v1.2.0 (Week 18)

---

## Communication Plan

### Weekly Updates

- **Team Standup:** Daily (15 min) — blockers, progress
- **Sprint Review:** Every 2 weeks — demo completed features
- **Retrospective:** Every 2 weeks — what went well, what to improve

### Stakeholder Updates

- **Weekly Email:** Progress summary, risks, timeline
- **Demo:** Every 2 weeks — show working features
- **Launch Announcement:** Week 10 — product launch, usage stats

---

## Document Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | May 16, 2026 | Product Team | Initial roadmap |
