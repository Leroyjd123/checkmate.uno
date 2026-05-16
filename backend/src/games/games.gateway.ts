import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { GamesService } from './games.service';

interface GamePlayer {
  userId: string;
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
@Injectable()
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active games: gameId -> { host: GamePlayer, guest: GamePlayer }
  private activeGames = new Map<
    string,
    { host?: GamePlayer; guest?: GamePlayer }
  >();

  // Track user connections: userId -> socketId
  private userSockets = new Map<string, string>();

  constructor(private gamesService: GamesService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Find which user this socket belongs to
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        this.notifyGameStateIfActive(userId);
        break;
      }
    }
  }

  /**
   * Subscribe to a game room
   * Emits: opponent_joined (if both players present)
   */
  @SubscribeMessage('subscribe_game')
  handleSubscribeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; userId: string },
  ) {
    const { gameId, userId } = data;

    // Store user socket mapping
    this.userSockets.set(userId, client.id);

    // Join socket to game room
    client.join(`game:${gameId}`);

    // Track player in active games
    if (!this.activeGames.has(gameId)) {
      this.activeGames.set(gameId, {});
    }

    const gameState = this.activeGames.get(gameId);
    if (!gameState) return;

    // Determine if host or guest (this is a simple heuristic; ideally fetch from DB)
    if (!gameState.host) {
      gameState.host = { userId, socketId: client.id };
    } else if (!gameState.guest && gameState.host.userId !== userId) {
      gameState.guest = { userId, socketId: client.id };

      // Both players present - notify them
      this.server.to(`game:${gameId}`).emit('opponent_joined', {
        gameId,
        message: 'Opponent has joined the game',
      });
    }

    console.log(`User ${userId} subscribed to game ${gameId}`);
  }

  /**
   * Broadcast a move to the opponent
   * Emits: move_made (to opponent)
   */
  @SubscribeMessage('move_made')
  handleMoveMade(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      gameId: string;
      userId: string;
      from: string;
      to: string;
      boardState: string;
      currentTurn: string;
      isCheckmate: boolean;
    },
  ) {
    const { gameId, userId } = data;

    // Broadcast to others in the game room (not including sender)
    client.to(`game:${gameId}`).emit('move_made', {
      gameId,
      playerId: userId,
      from: data.from,
      to: data.to,
      boardState: data.boardState,
      currentTurn: data.currentTurn,
      isCheckmate: data.isCheckmate,
      timestamp: new Date().toISOString(),
    });

    console.log(
      `Move made in game ${gameId}: ${data.from} -> ${data.to} by ${userId}`,
    );
  }

  /**
   * Broadcast a card usage to the opponent
   * Emits: card_used (to opponent)
   */
  @SubscribeMessage('card_used')
  handleCardUsed(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      gameId: string;
      userId: string;
      cardId: string;
      cardType: string;
      activeEffects: any[];
    },
  ) {
    const { gameId, userId } = data;

    // Broadcast to others in the game room
    client.to(`game:${gameId}`).emit('card_used', {
      gameId,
      playerId: userId,
      cardId: data.cardId,
      cardType: data.cardType,
      activeEffects: data.activeEffects,
      timestamp: new Date().toISOString(),
    });

    console.log(`Card used in game ${gameId}: ${data.cardType} by ${userId}`);
  }

  /**
   * Broadcast game over (checkmate or forfeit)
   * Emits: game_over (to both players)
   */
  @SubscribeMessage('game_over')
  handleGameOver(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      gameId: string;
      winnerId: string;
      reason: 'checkmate' | 'forfeit' | 'timeout';
    },
  ) {
    const { gameId, winnerId, reason } = data;

    // Broadcast to everyone in the game room
    this.server.to(`game:${gameId}`).emit('game_over', {
      gameId,
      winnerId,
      reason,
      timestamp: new Date().toISOString(),
    });

    // Clean up active game tracking
    this.activeGames.delete(gameId);

    console.log(`Game over in ${gameId}: ${reason}, winner: ${winnerId}`);
  }

  /**
   * Player forfeits
   * Emits: game_over with reason: "forfeit"
   */
  @SubscribeMessage('forfeit')
  handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; userId: string },
  ) {
    const { gameId, userId } = data;

    // Broadcast game over with forfeit
    this.server.to(`game:${gameId}`).emit('game_over', {
      gameId,
      forfeitedBy: userId,
      reason: 'forfeit',
      timestamp: new Date().toISOString(),
    });

    // Clean up
    this.activeGames.delete(gameId);

    console.log(`Game ${gameId} forfeited by ${userId}`);
  }

  /**
   * Request full game state update (useful after reconnection)
   * Client should make REST call to GET /api/games/:id to get latest state
   */
  @SubscribeMessage('request_game_state')
  handleRequestGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; userId: string },
  ) {
    // Don't send state through WebSocket - clients should use REST API
    // This is a notification that they should refresh from the server
    client.emit('refresh_state', {
      gameId: data.gameId,
      message: 'Please refresh game state from server',
    });

    console.log(`Game state refresh requested for ${data.gameId}`);
  }

  /**
   * Ping/Pong to detect disconnections
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * Helper: Notify relevant players if a game is still active
   */
  private notifyGameStateIfActive(userId: string) {
    for (const [gameId, gameState] of this.activeGames.entries()) {
      if (gameState.host?.userId === userId || gameState.guest?.userId === userId) {
        // One player disconnected - notify the other
        const otherPlayer =
          gameState.host?.userId === userId ? gameState.guest : gameState.host;

        if (otherPlayer) {
          this.server.to(`game:${gameId}`).emit('opponent_disconnected', {
            gameId,
            message: 'Opponent has disconnected',
            reconnectTimeout: 30000, // 30 second timeout before forfeit
          });

          console.log(
            `Opponent disconnected in game ${gameId}. Waiting for reconnect...`,
          );
        }
      }
    }
  }
}
