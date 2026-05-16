# WebSocket Events Guide

**Real-time game synchronization between players.**

Server: `ws://localhost:3000` (Socket.io)

---

## Client Events (Frontend → Backend)

### `subscribe_game`
Subscribe to a game room to receive real-time updates.

**Send:**
```javascript
socket.emit('subscribe_game', {
  gameId: 'game-uuid',
  userId: 'user-uuid'
});
```

**Receive:**
```javascript
// When opponent joins
socket.on('opponent_joined', (data) => {
  console.log(data.message); // "Opponent has joined the game"
  setGameStarted(true);
});
```

---

### `move_made`
Broadcast a move to the opponent.

**Send:**
```javascript
socket.emit('move_made', {
  gameId: 'game-uuid',
  userId: 'user-uuid',
  from: 'e2',
  to: 'e4',
  boardState: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
  currentTurn: 'black',
  isCheckmate: false
});
```

**Opponent Receives:**
```javascript
socket.on('move_made', (data) => {
  // data = { gameId, playerId, from, to, boardState, currentTurn, isCheckmate, timestamp }
  updateBoard(data.boardState);
  setCurrentTurn(data.currentTurn);
});
```

---

### `card_used`
Broadcast power card usage to the opponent.

**Send:**
```javascript
socket.emit('card_used', {
  gameId: 'game-uuid',
  userId: 'user-uuid',
  cardId: 'card-uuid',
  cardType: 'skip_turn',
  activeEffects: [
    {
      type: 'skip_turn',
      pieceSquare: null,
      turnsRemaining: 1,
      appliedBy: 'user-uuid'
    }
  ]
});
```

**Opponent Receives:**
```javascript
socket.on('card_used', (data) => {
  // data = { gameId, playerId, cardId, cardType, activeEffects, timestamp }
  updateActiveEffects(data.activeEffects);
  showCardNotification(`${data.cardType} was played!`);
});
```

---

### `game_over`
Announce game end (checkmate or forfeit).

**Send:**
```javascript
socket.emit('game_over', {
  gameId: 'game-uuid',
  winnerId: 'user-uuid',
  reason: 'checkmate' // or 'forfeit' | 'timeout'
});
```

**Both Players Receive:**
```javascript
socket.on('game_over', (data) => {
  // data = { gameId, winnerId, reason, timestamp }
  showGameOverScreen(data.winnerId);
  setGameStatus('completed');
});
```

---

### `forfeit`
Player forfeits the game.

**Send:**
```javascript
socket.emit('forfeit', {
  gameId: 'game-uuid',
  userId: 'user-uuid'
});
```

**Both Players Receive:**
```javascript
socket.on('game_over', (data) => {
  // data = { gameId, forfeitedBy, reason: 'forfeit', timestamp }
  alert(`${data.forfeitedBy} forfeited!`);
});
```

---

### `request_game_state`
Request a full game state refresh (e.g., after reconnection).

**Send:**
```javascript
socket.emit('request_game_state', {
  gameId: 'game-uuid',
  userId: 'user-uuid'
});
```

**Receive:**
```javascript
socket.on('refresh_state', (data) => {
  // Server tells you to fetch latest state via REST API
  const game = await fetch(`/api/games/${data.gameId}`);
  updateGame(game);
});
```

---

### `ping`
Test connection / keep-alive.

**Send:**
```javascript
socket.emit('ping');
```

**Receive:**
```javascript
socket.on('pong', (data) => {
  console.log('Server ping response at:', data.timestamp);
});
```

---

## Server Events (Backend → Frontend)

| Event | When | Data |
|-------|------|------|
| `opponent_joined` | Guest joins room | `{ gameId, message }` |
| `move_made` | Opponent executes move | `{ gameId, playerId, from, to, boardState, currentTurn, isCheckmate, timestamp }` |
| `card_used` | Opponent plays card | `{ gameId, playerId, cardId, cardType, activeEffects, timestamp }` |
| `game_over` | Game ends | `{ gameId, winnerId, reason, timestamp }` |
| `opponent_disconnected` | Opponent loses connection | `{ gameId, message, reconnectTimeout: 30000 }` |
| `refresh_state` | Sync required | `{ gameId, message }` |
| `pong` | Response to ping | `{ timestamp }` |

---

## Frontend Implementation Guide

### 1. Connect Socket.io Client

```typescript
// frontend/src/lib/socket.ts
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

socket.on('connect', () => {
  console.log('Connected to game server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

### 2. Subscribe When Game Starts

```typescript
// In game component
import { socket } from '@/lib/socket';

useEffect(() => {
  // Subscribe when game loads
  socket.emit('subscribe_game', {
    gameId: gameId,
    userId: userId
  });

  return () => {
    // Clean up when component unmounts
    socket.off('opponent_joined');
    socket.off('move_made');
    socket.off('card_used');
    socket.off('game_over');
  };
}, [gameId, userId]);
```

### 3. Listen for Opponent Moves

```typescript
useEffect(() => {
  socket.on('move_made', (data) => {
    // Update board state
    setBoard(fenToBoard(data.boardState));
    setCurrentTurn(data.currentTurn);
    
    // Check for checkmate
    if (data.isCheckmate) {
      setGameOver(true);
      setWinner(data.playerId);
    }
    
    // Re-enable move input if it's your turn
    if (isYourTurn(data.currentTurn)) {
      setMoveEnabled(true);
    }
  });

  return () => socket.off('move_made');
}, []);
```

### 4. Send Your Move

```typescript
async function handleMove(from: string, to: string) {
  try {
    // First, execute move on backend (validate)
    const response = await fetch(`/api/games/${gameId}/move`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to })
    });

    const gameState = await response.json();

    // Then broadcast via WebSocket for real-time sync
    socket.emit('move_made', {
      gameId,
      userId,
      from,
      to,
      boardState: gameState.boardState,
      currentTurn: gameState.currentTurn,
      isCheckmate: gameState.isCheckmate
    });

  } catch (error) {
    console.error('Move failed:', error);
  }
}
```

### 5. Listen for Card Usage

```typescript
useEffect(() => {
  socket.on('card_used', (data) => {
    // Update active effects
    setActiveEffects(data.activeEffects);
    
    // Show notification
    toast.info(`Opponent used ${data.cardType}!`);
    
    // Update UI (highlight affected pieces if needed)
    updateBoardVisualsForEffects(data.activeEffects);
  });

  return () => socket.off('card_used');
}, []);
```

### 6. Send Card Usage

```typescript
async function handleUseCard(cardId: string) {
  try {
    // Execute on backend first
    const response = await fetch(`/api/games/${gameId}/use-card`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ card_id: cardId })
    });

    const result = await response.json();

    // Broadcast via WebSocket
    socket.emit('card_used', {
      gameId,
      userId,
      cardId,
      cardType: result.cardUsed,
      activeEffects: result.activeEffects
    });

  } catch (error) {
    console.error('Card usage failed:', error);
  }
}
```

### 7. Handle Game Over

```typescript
useEffect(() => {
  socket.on('game_over', (data) => {
    setGameStatus('completed');
    
    if (data.reason === 'checkmate') {
      setWinner(data.winnerId);
      showMessage(`Checkmate! ${data.winnerId === userId ? 'You' : 'Opponent'} won!`);
    } else if (data.reason === 'forfeit') {
      setWinner(data.forfeitedBy === userId ? 'opponent' : 'you');
      showMessage(`${data.forfeitedBy === userId ? 'You' : 'Opponent'} forfeited!`);
    }
    
    showGameOverScreen();
  });

  return () => socket.off('game_over');
}, []);
```

### 8. Handle Disconnection (Reconnect Dialog)

```typescript
useEffect(() => {
  socket.on('opponent_disconnected', (data) => {
    setOpponentDisconnected(true);
    setReconnectCountdown(30); // 30 second timeout
    
    // Show dialog: "Opponent disconnected. They have 30 seconds to reconnect."
    showDisconnectDialog();
  });

  socket.on('opponent_joined', (data) => {
    // Opponent reconnected!
    setOpponentDisconnected(false);
    showMessage('Opponent reconnected');
  });

  return () => {
    socket.off('opponent_disconnected');
    socket.off('opponent_joined');
  };
}, []);
```

---

## Implementation Checklist

- [ ] Install `socket.io-client` in frontend
- [ ] Create socket service/singleton
- [ ] Connect socket when app loads
- [ ] Subscribe to game when game starts
- [ ] Listen for `move_made` events
- [ ] Listen for `card_used` events
- [ ] Listen for `game_over` events
- [ ] Listen for `opponent_disconnected` events
- [ ] Emit `move_made` after REST API move succeeds
- [ ] Emit `card_used` after REST API card succeeds
- [ ] Emit `forfeit` when player forfeits
- [ ] Handle reconnection scenarios
- [ ] Update board UI in real-time
- [ ] Show active effects visually
- [ ] Display game over screen

---

## Notes

1. **REST API First, WebSocket Second:** Always call REST endpoint first to validate, then broadcast via WebSocket
2. **Polling Fallback:** If WebSocket fails, fall back to polling `GET /api/games/:id` every 1-2 seconds
3. **Timestamps:** All events include timestamp for ordering
4. **Reconnection:** Socket.io auto-reconnects with exponential backoff
5. **Error Handling:** Check REST response before emitting WebSocket events

---

## Troubleshooting

**"Cannot connect to WebSocket"**
- Ensure backend is running on port 3000
- Check CORS settings (enabled for `*`)
- Check browser console for connection errors

**"Move not syncing to opponent"**
- Make sure both REST API and WebSocket calls succeed
- Check that gameId and userId match
- Verify opponent is subscribed to the same game room

**"Effects not showing"**
- Ensure activeEffects are updated in state
- Check that board UI renders activeEffects
- Verify effect turnsRemaining > 0 before showing

**"Opponent moves not appearing"**
- Check WebSocket connection status
- Verify opponent is subscribed to game
- Fall back to polling if needed
- Check browser network tab for WebSocket messages

---

## Performance Tips

1. Debounce move input (prevent spam)
2. Only update board when necessary (not every ping)
3. Batch effect updates if multiple cards played
4. Disconnect socket when leaving game page
5. Use socket.off() to remove listeners (prevent memory leaks)

---

See [`BACKEND_QUICK_START.md`](./BACKEND_QUICK_START.md) for REST API integration examples.
