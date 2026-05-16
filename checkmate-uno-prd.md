# Checkmate.Uno — Product Requirements Document

## Document Metadata

**Product:** Checkmate.Uno  
**Document Type:** PRD  
**Version:** v1.0  
**Status:** Draft  
**Author:** Product Team  
**Date:** May 16, 2026  
**Primary Owner:** To be assigned  
**Secondary Owner:** To be assigned  

---

## Glossary

| Term | Definition |
|---|---|
| Power Card | One-time use ability card that modifies chess rules or board state |
| Room Code | 6-character alphanumeric code used to join online multiplayer games |
| Chess Engine | AI opponent that follows standard chess rules and uses power cards |
| Turn Timer | Optional countdown timer for each player's move |
| Board State | Current position of all pieces, active power cards, and game phase |
| Theme | Visual appearance configuration for board, pieces, and UI |

---

## Background

Chess remains one of the most popular strategy games globally, but traditional chess can feel rigid and predictable for casual players. Meanwhile, card-based games like Uno have proven that introducing controlled randomness creates engaging, shareable experiences. The hybrid game market (chess variants, tactical card games) is growing but lacks a simple, viral-ready fusion game.

Checkmate.Uno merges chess with power cards to create a tactical game where skill matters but surprises happen. The concept emerged from observing streamers play chess variants and noticing strong engagement when rule-breaking mechanics were introduced.

**Why now:**
- Chess popularity surged post-2020 (Queen's Gambit effect, online tournaments)
- Web-based multiplayer games can launch and iterate quickly
- Modern web stack (Next.js + Supabase) allows rapid MVP development
- Viral potential through streamer content and social sharing

---

## Objective

Launch a fully functional chess variant game that combines traditional chess with 8 power cards, playable in three modes: local 2-player, vs computer, and online multiplayer. The game must be simple enough for casual players to understand within 2 minutes, yet deep enough for replay value.

Success means players complete games, share room codes, and return for multiple sessions.

---

## Success Metrics

| Metric | Target | Measurement Window |
|---|---|---|
| Primary: Games Completed | 500+ in first month | 30 days post-launch |
| Secondary: Return Rate | 30% of players play 3+ games | 7 days post-first-game |
| Engagement: Avg Game Duration | 8-15 minutes | Per completed game |
| Viral: Room Code Shares | 100+ room codes created | First month |
| Technical: API Response Time | <200ms for move validation | P95 latency |

**Measurement Method:**
- Supabase database queries for game completions, user sessions
- Event tracking on: game start, game end, move count, power card usage
- Room code creation and join events

---

## Target Users

### Primary Users
- **Casual Chess Players** — know basic rules, play occasionally, age 18-35
- **Card Game Fans** — enjoy Uno/tactical games, want quick sessions
- **Streamers/Content Creators** — looking for novel, watchable game content

### Secondary Users
- **Chess Enthusiasts** — traditional players curious about variants
- **Friend Groups** — looking for turn-based games to play together online

### Internal Users
- None — no admin panel required for MVP

---

## Scope

### Included
- 8 power cards with clear chess effects (Skip Turn, Reverse Move, Extra Move, Teleport, Shield, Sacrifice, Wild Swap, Freeze)
- 3 game modes: Local 2-player (same device), VS Computer, Online Multiplayer (room code based)
- Standard chess board (8x8) with traditional piece movement rules
- Basic chess rules: standard movement, check detection, checkmate detection
- Simplified chess rules: no castling, no en passant, pawn promotion to Queen only
- Each player starts with 3 random power cards, one-time use
- 3 theme options: Light, Dark, Neon (color schemes only)
- User accounts with email + password authentication
- Game state persistence in database
- Real-time move updates for online mode via WebSocket
- Responsive design for desktop and mobile web browsers

### Excluded from MVP
- Advanced chess rules (castling, en passant, pawn promotion options)
- Ranked matchmaking or ELO rating system
- In-game chat or voice
- Spectator mode
- Game replay or move history export
- Custom power card creation
- Tournament mode or leaderboards
- Social features (friend lists, profiles)
- Mobile native apps (iOS/Android)
- Internationalization (English only)
- Payment or monetization features

---

## User Flow

### Flow 1: Local 2-Player Game

1. User lands on homepage
2. User clicks "Play Local"
3. System displays board with 3 random power cards per player (shown at bottom for Player 1, top for Player 2)
4. System shows "White's Turn" indicator
5. User (White) optionally clicks a power card to activate it, OR clicks a piece to move
6. If power card clicked: system applies effect immediately, card disappears from hand
7. If piece clicked: system highlights legal moves
8. User clicks destination square
9. System validates move, updates board, switches turn indicator to "Black's Turn"
10. Device is passed to other player
11. Steps 5-10 repeat until checkmate detected
12. System displays winner modal with "Play Again" and "Main Menu" options

### Flow 2: VS Computer Game

1. User lands on homepage
2. User clicks "Play vs Computer"
3. System displays board with 3 random power cards for user (bottom), 3 hidden cards for computer
4. User makes move (with or without power card)
5. System processes user move
6. System calculates computer move using basic chess AI (selects random legal move, 20% chance to use random power card)
7. Computer move executes immediately
8. Steps 4-7 repeat until checkmate
9. System displays winner modal

### Flow 3: Online Multiplayer Game

**Host creates game:**
1. User clicks "Play Online"
2. System prompts: "Create Room" or "Join Room"
3. User clicks "Create Room"
4. System generates 6-character room code (e.g., "A3X9K2")
5. System displays "Waiting for opponent..." screen with room code prominently shown and "Copy Code" button
6. User shares code via any channel
7. When opponent joins, system starts game immediately

**Guest joins game:**
1. User clicks "Play Online" → "Join Room"
2. System shows input field: "Enter Room Code"
3. User types code and clicks "Join"
4. System validates code, adds user to room
5. Game starts immediately

**During online game:**
1. Both players see the board, their own cards at bottom, opponent cards hidden at top
2. Moves and power card usage sync in real-time via WebSocket
3. Turn indicator updates for both players
4. Game continues until checkmate

---

## System Flow

### Game Initialization Flow

**Trigger:** User selects game mode and confirms start

**Process:**
1. System generates new game record in `games` table with fields: `id`, `mode` (local/computer/online), `room_code` (if online), `status` (in_progress), `current_turn` (white), `board_state` (FEN notation), `created_at`
2. System generates 8 random power cards from pool of 8 types
3. System assigns 3 cards to Player 1 (white), 3 cards to Player 2 (black), stores in `game_cards` table
4. System initializes board state using standard chess starting position (FEN: `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`)
5. System renders board on client with pieces positioned
6. System displays power cards UI for each player
7. If online mode: system establishes WebSocket connection, subscribes to room channel

**Persistence:** Game state saved to Supabase `games` table, cards saved to `game_cards` table

**Events Emitted:** `game_created`, WebSocket room join event (online mode only)

---

### Move Execution Flow

**Trigger:** Player clicks piece → destination OR plays power card

**Power Card Path:**
1. Client validates: is it player's turn? Does player own this card?
2. Client sends power card use request to backend: `POST /api/games/:id/use-card` with `{cardType, targetData}`
3. Backend validates ownership, game status, turn
4. Backend applies card effect to board state (modifies FEN string or game metadata)
5. Backend saves updated state to database
6. Backend emits WebSocket event (online mode): `card_used` with new state
7. Backend returns success response
8. Client updates UI: removes card from hand, updates board if needed
9. Turn does NOT switch after card use (player still makes chess move)

**Chess Move Path:**
1. Client validates: is piece movable? Is destination legal per chess rules + active effects?
2. Client sends move request to backend: `POST /api/games/:id/move` with `{from, to, piece}`
3. Backend validates move legality using chess library (chess.js)
4. Backend checks for active shields, freezes, or movement modifications from power cards
5. Backend applies move: updates FEN notation
6. Backend checks for check/checkmate conditions
7. Backend updates `current_turn` to opponent
8. Backend saves state to database
9. Backend emits WebSocket event (online mode): `move_made` with new state
10. Backend returns response with new state + check/checkmate status
11. Client updates board visually, animates piece movement
12. Client switches turn indicator

**Failure Handling:**
- Invalid card use → return 400 with error message, no state change
- Illegal chess move → return 400 with error message, no state change
- Database write failure → return 500, game remains in previous valid state
- WebSocket disconnection → game pauses, reconnect within 60s restores, else game forfeited

---

### Checkmate Detection Flow

**Trigger:** After any move execution

**Process:**
1. Backend evaluates current board state using chess.js `isCheckmate()` method
2. If checkmate detected:
   - Backend sets `games.status = 'completed'`
   - Backend sets `games.winner = [player_id]`
   - Backend saves to database
   - Backend emits WebSocket event (online): `game_over` with winner
3. Client displays winner modal with winner name, "Play Again", "Main Menu"

---

### Room Code Generation Flow (Online Mode)

**Trigger:** User clicks "Create Room"

**Process:**
1. System generates random 6-character alphanumeric code (uppercase + digits, excludes ambiguous chars: 0, O, 1, I)
2. System checks `games` table for collision (code already exists with `status IN ['waiting', 'in_progress']`)
3. If collision: regenerate and retry (max 3 attempts)
4. If unique: insert game record with `room_code`, `mode = 'online'`, `status = 'waiting'`, `host_id = current_user_id`
5. Return room code to client
6. Client displays "Waiting for opponent" screen with code

**Room Join Flow:**
1. Client sends `POST /api/games/join` with `{room_code}`
2. Backend queries `games` table WHERE `room_code = :code AND status = 'waiting'`
3. If not found → return 404 "Room not found or game already started"
4. If found → update `guest_id = current_user_id`, `status = 'in_progress'`
5. Emit WebSocket event to host: `opponent_joined`
6. Both clients initialize game board

---

## Functional Requirements

### FR-1: Power Card System
- Each game starts with 8 power cards drawn randomly from the 8-card pool
- Player 1 receives 3 cards, Player 2 receives 3 cards, 2 cards remain unused
- Each card is single-use: after activation, it is removed from player's hand
- Cards can be activated before OR after the chess move on a player's turn
- Card effects execute immediately upon activation

### FR-2: Power Card Definitions

| Card Type | Effect |
|---|---|
| Skip Turn | Opponent's next turn is skipped entirely (they cannot move or play cards) |
| Reverse Move | Undo opponent's last move (piece returns to previous position, captured piece restored) |
| Extra Move | Current player may make 2 chess moves in sequence this turn |
| Teleport | Move any piece (yours or opponent's) to any empty square on the board |
| Shield | Select one of your pieces; it cannot be captured for the next 3 turns |
| Sacrifice | Opponent must immediately remove one of their pawns from the board (if no pawns, card has no effect) |
| Wild Swap | Swap the positions of any 2 pieces on the board (can be same color or different colors) |
| Freeze | Select one opponent piece; it cannot move for the next 2 turns |

### FR-3: Chess Move Validation
- All standard chess movement rules apply: pawns move forward 1 (or 2 from starting position), knights L-shape, bishops diagonal, rooks straight, queen any direction, king 1 square any direction
- Pawns promote to Queen automatically upon reaching opposite end
- Check detection: system must detect when king is under attack, prevent moves that leave king in check
- Checkmate detection: system must detect when king is in check with no legal moves available
- Castling NOT supported in MVP
- En passant NOT supported in MVP

### FR-4: Game Modes
- **Local 2-Player:** Same device, turn-based, manual device pass, no accounts required
- **VS Computer:** User vs basic AI opponent, AI makes random legal moves, AI randomly uses cards (20% chance per turn)
- **Online Multiplayer:** Two authenticated users, room code based, real-time sync via WebSocket

### FR-5: Authentication
- Users can create account with email + password
- Email validation required (valid format check, not email verification)
- Password requirements: minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- Users can log in with email + password
- Session persists via JWT token stored in httpOnly cookie
- No password reset flow in MVP (handled manually)
- Local mode does NOT require authentication
- Online mode requires both users to be authenticated

### FR-6: Theme System
- 3 themes available: Light, Dark, Neon
- Theme affects board colors, piece colors, background, UI elements
- Theme selection persists per user (stored in user preferences)
- Theme can be changed mid-game from settings menu

### FR-7: Real-time Synchronization (Online Mode)
- Moves sync within 500ms
- Power card usage syncs within 500ms
- Turn indicator updates in real-time for both players
- If either player disconnects: game pauses, opponent sees "Waiting for reconnection..." message
- If reconnection within 60 seconds: game resumes from last saved state
- If no reconnection after 60 seconds: opponent wins by forfeit

### FR-8: Game State Persistence
- All game states saved to database after every move and card use
- Users can refresh browser and resume game from last state (online mode only)
- Local and VS Computer games lost on page refresh (no persistence)

---

## Business Rules

### BR-1: Card Activation Rules
- Cards can only be played on the card owner's turn
- Cards cannot be played during opponent's turn
- Maximum 1 card can be played per turn
- If card has no valid target (e.g., Sacrifice when opponent has no pawns), card is wasted and removed from hand
- Card effects that create illegal board states (e.g., Teleport king into check) are prevented by validation

### BR-2: Shield Effect Rules
- Shielded piece cannot be captured by any means (normal moves, Teleport, Wild Swap)
- Shield lasts 3 turns (counted as: opponent turn 1, player turn, opponent turn 2)
- Shield icon displayed on piece while active
- Multiple pieces can be shielded simultaneously
- Shielded piece CAN still move normally

### BR-3: Freeze Effect Rules
- Frozen piece cannot be moved by its owner
- Frozen piece CAN be captured normally
- Frozen piece CAN be moved by opponent using Teleport or Wild Swap
- Freeze lasts 2 turns (opponent turn 1, opponent turn 2)
- Freeze icon displayed on piece while active

### BR-4: Room Code Rules
- Room codes are case-insensitive for joining (stored uppercase)
- Room code expires when game status changes to 'completed' or 'abandoned'
- Room codes cannot be reused even after game completes
- Maximum 1 waiting game per user (cannot create multiple rooms simultaneously)

### BR-5: Win Conditions
- Checkmate only (traditional chess win)
- Forfeit if opponent disconnects for >60 seconds (online mode)
- No win condition related to power cards

### BR-6: Turn Order
- White always moves first
- Turn alternates after each chess move
- Playing a power card does NOT end the turn or switch the turn indicator
- Skip Turn card causes one turn to be skipped, then normal alternation resumes

---

## Explicit Do / Do Not

### Do
- Validate all moves server-side even though client shows legal moves
- Store complete board state after every action (FEN notation + active effects)
- Prevent page refresh from destroying online games (use game state persistence)
- Show opponent's card count but not card types (hidden information)
- Log every card use and move for debugging and analytics
- Allow theme changes mid-game without restarting

### Do Not
- Do not implement undo/redo for chess moves (only Reverse Move card)
- Do not allow users to see opponent's cards
- Do not allow move takeback after confirmation
- Do not implement chat (MVP scope cut)
- Do not show move history or captured pieces UI (MVP scope cut)
- Do not implement spectator mode or game sharing links beyond room code
- Do not add animations longer than 500ms (keep game snappy)
- Do not use client-side only validation for moves (always validate server-side)

---

## Dependencies

### External Dependencies
- **Supabase:** Database, authentication, real-time subscriptions
- **Vercel:** Frontend hosting and deployment
- **Railway/Render:** Backend hosting (free tier)
- **chess.js:** Chess move validation and game logic library

### Team Dependencies
- **Design:** Figma link for theme colors and piece SVGs (to be provided)
- **DevOps:** Supabase project setup and environment variables

### Data Dependencies
- None — self-contained application

---

## Non-Functional Requirements

### Performance
- Page load time <2 seconds on 3G connection
- Move validation and execution <200ms server response time
- WebSocket message delivery <500ms
- Database query response time <100ms (P95)

### Scalability
- Support 100 concurrent online games in MVP
- Database designed for 10,000 completed games without performance degradation

### Security
- All API endpoints require authentication (except local mode)
- JWT tokens expire after 7 days
- Passwords hashed using bcrypt (cost factor 10)
- SQL injection prevention via parameterized queries (Supabase client)
- XSS prevention via React's built-in escaping

### Reliability
- 99% uptime target
- Graceful handling of database connection failures
- Auto-reconnect WebSocket on connection drop

### Usability
- Mobile responsive design (minimum 375px width support)
- Touch-friendly piece selection and movement
- Color contrast ratios meet WCAG AA standards
- Game rules accessible via "How to Play" modal on homepage

---

## Acceptance Criteria

### AC-1: Power Card Functionality
- Given a player has a power card in hand
- When the player clicks the card on their turn
- Then the card effect executes immediately
- And the card is removed from the player's hand
- And the card effect is visually represented on the board if applicable (shield icon, freeze icon)

### AC-2: Chess Move Validation
- Given it is a player's turn
- When the player attempts an illegal move (e.g., moving bishop straight)
- Then the system prevents the move
- And displays an error message "Illegal move"
- And the board state does not change

### AC-3: Checkmate Detection
- Given the current board state is checkmate
- When the move that causes checkmate is executed
- Then the system detects checkmate within 100ms
- And displays winner modal with correct player name
- And saves game status as 'completed' in database
- And prevents further moves

### AC-4: Online Room Creation
- Given an authenticated user clicks "Create Room"
- When the system generates a room code
- Then the code is 6 characters, alphanumeric, uppercase
- And the code is unique (no collision with active games)
- And the system displays "Waiting for opponent" screen
- And the room code is prominently shown with a "Copy" button

### AC-5: Online Room Join
- Given User A has created room with code "A3X9K2"
- When User B enters "a3x9k2" (lowercase) and clicks "Join"
- Then User B successfully joins the room (case-insensitive match)
- And both users see the game board
- And the game starts with White's turn

### AC-6: Real-time Move Sync
- Given two players in an online game
- When Player A makes a move
- Then Player B sees the move update within 500ms
- And Player B's turn indicator activates
- And both boards show identical state

### AC-7: Theme Persistence
- Given a logged-in user selects "Neon" theme
- When the user refreshes the page
- Then the theme remains "Neon"
- And all UI elements reflect the Neon color scheme

### AC-8: Shield Card Effect
- Given Player A activates "Shield" card on their Knight
- When Player B attempts to capture the shielded Knight
- Then the capture is prevented
- And an error message displays "This piece is shielded"
- And the Knight remains on the board with shield icon visible
- And after 3 turns, the shield expires and the Knight can be captured normally

---

## Edge Cases

### EC-1: Reverse Move on First Turn
- **Scenario:** Player B plays "Reverse Move" card on turn 1
- **Resolution:** Card has no effect (no previous move exists), card is consumed, turn continues

### EC-2: Sacrifice Card with No Pawns
- **Scenario:** Opponent has no pawns remaining
- **Resolution:** Card has no effect, card is consumed, turn continues

### EC-3: Teleport King into Check
- **Scenario:** Player attempts to teleport their King to a square under attack
- **Resolution:** System prevents the teleport, displays error "Cannot place King in check", card is NOT consumed, player must select valid target or cancel card

### EC-4: Multiple Active Shields
- **Scenario:** Player shields 2 pieces in consecutive turns
- **Resolution:** Both shields remain active with independent 3-turn timers, tracked per piece

### EC-5: Wild Swap During Check
- **Scenario:** Player is in check, plays Wild Swap to move a piece
- **Resolution:** System validates that swap resolves check, if not, prevents swap and shows "Must resolve check", card is NOT consumed

### EC-6: Room Code Collision
- **Scenario:** Generated room code already exists in database
- **Resolution:** System regenerates code automatically (max 3 attempts), if all attempts fail, returns error "Unable to create room, try again"

### EC-7: Both Players Disconnect in Online Game
- **Scenario:** Both players lose connection simultaneously
- **Resolution:** Game state persists in database, first player to reconnect sees "Waiting for opponent", game resumes when second player reconnects

### EC-8: Extra Move Results in Checkmate
- **Scenario:** Player uses Extra Move card, first move does not end game, second move results in checkmate
- **Resolution:** Game ends immediately after checkmate move, player does not get to play additional cards

### EC-9: Freeze and Shield on Same Piece
- **Scenario:** Piece is both frozen and shielded
- **Resolution:** Both effects apply independently — piece cannot move (frozen) AND cannot be captured (shielded)

---

## Assumptions

### Business Assumptions
- Users understand basic chess rules (no in-game tutorial for chess movement)
- Target audience has reliable internet connection for online mode (3G minimum)
- Users are willing to create accounts for online play
- Streamers will organically discover and share the game

### Technical Assumptions
- Supabase free tier sufficient for MVP (500MB database, 2GB bandwidth/month)
- Vercel free tier sufficient for frontend hosting
- Railway/Render free tier sufficient for backend hosting (512MB RAM)
- WebSocket connections stable for 15-minute game duration
- chess.js library handles all edge cases in move validation

### Dependency Assumptions
- Supabase real-time subscriptions work reliably for <100 concurrent games
- Vercel and Railway/Render deploy without custom infrastructure setup
- No CDN required for acceptable performance

---

## Out of Scope

- Advanced chess features (stalemate detection, threefold repetition, 50-move rule)
- Mobile native apps
- AI difficulty levels (only random AI in MVP)
- Game replays or PGN export
- Social features (profiles, friend requests, game history)
- Leaderboards or ranking system
- In-game chat
- Spectator mode
- Custom card decks or card unlocks
- Monetization (ads, premium features, cosmetics)
- Internationalization
- Accessibility features beyond WCAG AA color contrast

---

## Sample Scenarios

### Scenario 1: Casual Game with Power Card Surprise

**Context:** Alice and Bob are playing online. Alice is about to capture Bob's Queen.

**Input:**
- Alice has "Shield" card in hand
- Bob has "Reverse Move" card in hand
- Current turn: Alice
- Board state: Alice's Rook positioned to capture Bob's Queen next move

**Processing:**
1. Alice moves Rook to capture Bob's Queen
2. System validates move, updates board, switches turn to Bob
3. Bob immediately plays "Reverse Move" card
4. System undoes Alice's last move, restores Queen to board
5. Bob makes a different move with his Knight
6. Turn switches back to Alice

**Output:**
- Alice's Rook back at original position
- Bob's Queen restored and safe
- Bob's "Reverse Move" card removed from hand
- Turn indicator shows "White's Turn" (Alice)

---

### Scenario 2: Computer Game with Multiple Cards

**Context:** User playing VS Computer mode, user has 2 cards remaining.

**Input:**
- User has "Extra Move" and "Freeze" cards
- Computer has "Teleport" and "Wild Swap" cards (hidden from user)
- Current turn: User
- User is in check from computer's Bishop

**Processing:**
1. User plays "Freeze" card on computer's Bishop
2. System applies freeze effect (2 turns)
3. User moves King out of check
4. Turn switches to Computer
5. Computer AI calculates moves (frozen Bishop cannot move)
6. Computer plays "Teleport" card (20% random chance triggered)
7. Computer teleports user's Knight to far corner of board
8. Turn switches back to User

**Output:**
- Computer's Bishop frozen with icon overlay (1 turn remaining)
- User's Knight teleported
- User has 1 card remaining ("Extra Move")
- Computer has 1 card remaining (not visible to user)
- Turn indicator shows "White's Turn" (User)

---

## Design Reference

**Link:** [To be provided — Figma design for themes and piece SVGs]

**Expected Delivery:** Week 1 of development

---

## Technical Considerations

### Frontend Stack
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **State Management:** React Context API (sufficient for game state)
- **WebSocket Client:** Socket.io-client
- **Chess Logic:** chess.js (client-side validation + visual feedback)

### Backend Stack
- **Framework:** NestJS 10
- **Database ORM:** Prisma
- **WebSocket:** Socket.io
- **Authentication:** JWT via Supabase Auth
- **Chess Validation:** chess.js (server-side authoritative validation)

### Database Schema (High-Level)
- `users` table: id, email, password_hash, theme_preference, created_at
- `games` table: id, mode, room_code, status, host_id, guest_id, current_turn, board_state (FEN), winner_id, created_at, updated_at
- `game_cards` table: id, game_id, player_id, card_type, status (available/used)
- `moves` table: id, game_id, player_id, move_notation, timestamp (for analytics only, not game logic)

### Performance Optimizations
- Board state stored as FEN notation (compact string representation)
- WebSocket rooms scoped per game (reduces broadcast overhead)
- Database indexes on: games.room_code, games.status, game_cards.game_id

### Known Technical Risks
- **WebSocket scaling:** Free tier hosting may limit concurrent connections
- **Database writes:** High write frequency per game (every move + card) may hit rate limits
- **AI performance:** chess.js move generation may be slow for complex board states
- **Reconnection logic:** Complex state synchronization if both players disconnect/reconnect

---

## Migration Plan

Not applicable — new product, no existing system to migrate.

---

## CRM Impact

Not applicable — no CRM integration in MVP.

---

## Additional Notes

- Consider adding game timer (optional per game) in future iteration to prevent infinite games
- Future: Expand card pool to 20+ cards for variety
- Future: Add ELO rating system for online ranked matches
- Future: Implement game replay feature using moves table
- Potential partnership opportunity with chess streamers for launch

---

## Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | May 16, 2026 | Product Team | Initial draft |

---

**Review this draft. Let me know what to adjust or if any section needs more detail.**
