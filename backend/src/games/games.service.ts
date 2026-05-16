import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PostgresService } from '../database/postgres.service';
import { ChessService } from '../chess/chess.service';
import { CreateGameDto } from './dto/create-game.dto';
import { GameMode } from '../common/types';

@Injectable()
export class GamesService {
  constructor(
    private db: PostgresService,
    private chessService: ChessService,
  ) {}

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private generateAndAssignCards(): {
    hostCards: string[];
    guestCards: string[];
  } {
    const allCards = [
      'skip_turn',
      'reverse_move',
      'extra_move',
      'teleport',
      'shield',
      'sacrifice',
      'wild_swap',
      'freeze',
    ];

    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    return {
      hostCards: allCards.slice(0, 4),
      guestCards: allCards.slice(4, 8),
    };
  }

  async createGame(createGameDto: CreateGameDto, userId?: string) {
    const { mode } = createGameDto;
    const cards = this.generateAndAssignCards();
    const initialFen =
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    return this.db.transaction(async (client) => {
      const gameId = randomUUID();
      const roomCode = mode === 'online' ? this.generateRoomCode() : null;
      const status = mode === 'online' ? 'waiting' : 'in_progress';

      await client.query(
        `INSERT INTO games (id, mode, board_state, current_turn, status, room_code, host_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [gameId, mode, initialFen, 'white', status, roomCode, userId || null],
      );

      const cardValues: any[] = [];
      let paramCount = 1;
      let sql =
        'INSERT INTO game_cards (id, game_id, player_id, card_type) VALUES ';
      const valueSets: string[] = [];

      [...cards.hostCards, ...cards.guestCards].forEach((cardType, idx) => {
        const playerId = idx < cards.hostCards.length ? userId : null;
        const cardId = randomUUID();
        valueSets.push(
          `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`,
        );
        cardValues.push(cardId, gameId, playerId, cardType);
      });

      sql += valueSets.join(', ');
      await client.query(sql, cardValues);

      const game = {
        id: gameId,
        mode,
        board_state: initialFen,
        current_turn: 'white',
        status,
        room_code: roomCode,
      };

      const cardsResult = await client.query(
        `SELECT id, card_type FROM game_cards WHERE game_id = $1 AND player_id = $2`,
        [game.id, userId || null],
      );

      return {
        game: {
          id: game.id,
          mode: game.mode,
          room_code: game.room_code,
          status: game.status,
          board_state: game.board_state,
          current_turn: game.current_turn,
        },
        cards: cardsResult.rows.map((c: any) => ({
          id: c.id,
          type: c.card_type,
        })),
      };
    });
  }

  async getGame(gameId: string, userId?: string) {
    const gameResult = await this.db.queryOne(
      `SELECT * FROM games WHERE id = $1`,
      [gameId],
    );

    if (!gameResult) {
      return null;
    }

    if (
      gameResult.mode === 'online' &&
      userId &&
      gameResult.host_id !== userId &&
      gameResult.guest_id !== userId
    ) {
      return null;
    }

    const userCardsResult = await this.db.query(
      `SELECT id, card_type FROM game_cards WHERE game_id = $1 AND player_id = $2`,
      [gameId, userId],
    );

    const opponentId =
      gameResult.host_id === userId ? gameResult.guest_id : gameResult.host_id;

    let opponentCardCount = 0;
    if (opponentId) {
      const countResult = await this.db.queryOne(
        `SELECT COUNT(*) as count FROM game_cards WHERE game_id = $1 AND player_id = $2 AND status = 'available'`,
        [gameId, opponentId],
      );
      opponentCardCount = parseInt(countResult.count, 10);
    }

    return {
      id: gameResult.id,
      mode: gameResult.mode,
      status: gameResult.status,
      current_turn: gameResult.current_turn,
      board_state: gameResult.board_state,
      active_effects: gameResult.active_effects,
      your_cards: userCardsResult.rows.map((c: any) => ({
        id: c.id,
        type: c.card_type,
      })),
      opponent_card_count: opponentCardCount,
    };
  }

  async joinRoom(roomCode: string, userId: string) {
    const gameResult = await this.db.queryOne(
      `SELECT * FROM games WHERE room_code = $1`,
      [roomCode],
    );

    if (!gameResult) {
      throw new Error('Game not found');
    }

    if (gameResult.mode !== 'online') {
      throw new Error('Cannot join non-online game');
    }

    if (gameResult.status !== 'waiting') {
      throw new Error('Game already started or completed');
    }

    if (gameResult.guest_id) {
      throw new Error('Game already has a guest');
    }

    return this.db.transaction(async (client) => {
      await client.query(
        `UPDATE games SET guest_id = $1, status = 'in_progress' WHERE id = $2`,
        [userId, gameResult.id],
      );

      const cardsResult = await client.query(
        `SELECT id FROM game_cards WHERE game_id = $1 AND player_id IS NULL`,
        [gameResult.id],
      );

      const cardIds = cardsResult.rows.map((c: any) => c.id);
      if (cardIds.length > 0) {
        const placeholders = cardIds.map((_, i) => `$${i + 1}`).join(',');
        await client.query(
          `UPDATE game_cards SET player_id = $${cardIds.length + 1} WHERE id IN (${placeholders})`,
          [...cardIds, userId],
        );
      }

      return this.getGame(gameResult.id, userId);
    });
  }

  async executeMove(gameId: string, userId: string, from: string, to: string) {
    const gameResult = await this.db.queryOne(
      `SELECT * FROM games WHERE id = $1`,
      [gameId],
    );

    if (!gameResult) {
      throw new Error('Game not found');
    }

    if (gameResult.host_id !== userId && gameResult.guest_id !== userId) {
      throw new Error('Not a participant in this game');
    }

    const isWhiteTurn = gameResult.current_turn === 'white';
    const userIsHost = gameResult.host_id === userId;
    const isUserTurn =
      (isWhiteTurn && userIsHost) || (!isWhiteTurn && !userIsHost);

    if (!isUserTurn) {
      throw new Error('Not your turn');
    }

    if (gameResult.status !== 'in_progress') {
      throw new Error('Game is not in progress');
    }

    const chess = this.chessService.createFromFen(gameResult.board_state);

    if (!this.chessService.isMoveLegal(chess, from, to)) {
      throw new Error('Illegal move');
    }

    const activeEffects = gameResult.active_effects || [];
    const skipTurnEffect = activeEffects.find(
      (e: any) =>
        e.type === 'skip_turn' &&
        e.appliedBy !== userId &&
        e.turnsRemaining > 0,
    );

    if (skipTurnEffect) {
      const updatedEffects = activeEffects
        .filter((e: any) => !(e.type === 'skip_turn' && e.appliedBy !== userId))
        .map((e: any) =>
          e.type === 'skip_turn' ? { ...e, turnsRemaining: 0 } : e,
        )
        .filter((e: any) => e.turnsRemaining > 0);

      await this.db.query(
        `UPDATE games SET current_turn = $1, active_effects = $2 WHERE id = $3`,
        [
          isWhiteTurn ? 'black' : 'white',
          JSON.stringify(updatedEffects),
          gameId,
        ],
      );

      return this.getGame(gameId, userId);
    }

    const newFen = this.chessService.executeMove(chess, from, to);
    if (!newFen) {
      throw new Error('Failed to execute move');
    }

    const updatedChess = this.chessService.createFromFen(newFen);
    const newTurn =
      this.chessService.getTurn(updatedChess) === 'w' ? 'white' : 'black';
    const isCheckmate = this.chessService.isCheckmate(updatedChess);

    const updatedEffects = (activeEffects || [])
      .map((e: any) => ({
        ...e,
        turnsRemaining: Math.max(0, e.turnsRemaining - 1),
      }))
      .filter((e: any) => e.turnsRemaining > 0);

    return this.db.transaction(async (client) => {
      const moveId = randomUUID();
      await client.query(
        `INSERT INTO moves (id, game_id, player_id, move_notation) VALUES ($1, $2, $3, $4)`,
        [moveId, gameId, userId, `${from}${to}`],
      );

      const gameStatus = isCheckmate ? 'completed' : 'in_progress';
      const winnerId = isCheckmate ? userId : null;

      await client.query(
        `UPDATE games SET board_state = $1, current_turn = $2, status = $3, winner_id = $4, active_effects = $5 WHERE id = $6`,
        [
          newFen,
          newTurn,
          gameStatus,
          winnerId,
          JSON.stringify(updatedEffects),
          gameId,
        ],
      );

      return this.getGame(gameId, userId);
    });
  }

  async useCard(gameId: string, userId: string, cardId: string) {
    const gameResult = await this.db.queryOne(
      `SELECT * FROM games WHERE id = $1`,
      [gameId],
    );

    if (!gameResult) {
      throw new Error('Game not found');
    }

    const cardResult = await this.db.queryOne(
      `SELECT * FROM game_cards WHERE id = $1`,
      [cardId],
    );

    if (!cardResult) {
      throw new Error('Card not found');
    }

    if (cardResult.player_id !== userId) {
      throw new Error('Card does not belong to you');
    }

    if (cardResult.status !== 'available') {
      throw new Error('Card already used');
    }

    const activeEffects = gameResult.active_effects || [];
    let newEffect: any = null;

    switch (cardResult.card_type) {
      case 'skip_turn':
        newEffect = {
          type: 'skip_turn',
          pieceSquare: null,
          turnsRemaining: 1,
          appliedBy: userId,
        };
        break;
      case 'freeze':
        newEffect = {
          type: 'freeze',
          pieceSquare: null,
          turnsRemaining: 1,
          appliedBy: userId,
        };
        break;
      case 'shield':
        newEffect = {
          type: 'shield',
          pieceSquare: null,
          turnsRemaining: 1,
          appliedBy: userId,
        };
        break;
      case 'extra_move':
        newEffect = {
          type: 'extra_move',
          pieceSquare: null,
          turnsRemaining: 1,
          appliedBy: userId,
        };
        break;
    }

    return this.db.transaction(async (client) => {
      await client.query(
        `UPDATE game_cards SET status = 'used', used_at = NOW() WHERE id = $1`,
        [cardId],
      );

      if (newEffect) {
        activeEffects.push(newEffect);
      }

      await client.query(`UPDATE games SET active_effects = $1 WHERE id = $2`, [
        JSON.stringify(activeEffects),
        gameId,
      ]);

      return this.getGame(gameId, userId);
    });
  }
}
