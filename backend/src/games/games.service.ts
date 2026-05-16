import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ChessService } from '../chess/chess.service';
import { CreateGameDto } from './dto/create-game.dto';
import { GameMode } from '../common/types';
import { CardType } from '../generated/prisma/enums';

@Injectable()
export class GamesService {
  constructor(
    private prisma: PrismaService,
    private chessService: ChessService,
  ) {}

  /**
   * Generate a random 6-character room code
   * Excludes ambiguous characters: 0, O, 1, I
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Generate random 8 power cards and assign 3 to each player, discard 2
   */
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

    // Shuffle array
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
    }

    return {
      hostCards: allCards.slice(0, 3),
      guestCards: allCards.slice(3, 6),
    };
  }

  async createGame(createGameDto: CreateGameDto, userId?: string) {
    const { mode } = createGameDto;
    const cards = this.generateAndAssignCards();

    const gameData: any = {
      mode,
      boardState: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentTurn: 'white',
    };

    // For online games, generate room code and set host
    if (mode === 'online') {
      gameData.roomCode = this.generateRoomCode();
      gameData.status = 'waiting';
      if (userId) {
        gameData.hostId = userId;
      }
    } else {
      gameData.status = 'in_progress';
    }

    const game = await this.prisma.game.create({
      data: gameData,
    });

    // Create game cards
    const cardsData = [
      ...cards.hostCards.map((type) => ({
        gameId: game.id,
        playerId: mode === 'online' ? userId : null,
        cardType: type as CardType,
      })),
      ...cards.guestCards.map((type) => ({
        gameId: game.id,
        playerId: null, // Will be assigned when guest joins
        cardType: type as CardType,
      })),
    ];

    await this.prisma.gameCard.createMany({
      data: cardsData,
    });

    // Fetch created cards
    const gameCards = await this.prisma.gameCard.findMany({
      where: { gameId: game.id, playerId: userId || null },
    });

    return {
      game: {
        id: game.id,
        mode: game.mode,
        room_code: game.roomCode,
        status: game.status,
        board_state: game.boardState,
        current_turn: game.currentTurn,
      },
      cards: gameCards.map((c) => ({
        id: c.id,
        type: c.cardType,
      })),
    };
  }

  async getGame(gameId: string, userId?: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return null;
    }

    // For online mode, verify user is participant
    if (game.mode === 'online' && userId) {
      if (game.hostId !== userId && game.guestId !== userId) {
        return null;
      }
    }

    // Get user's cards
    const userCards = await this.prisma.gameCard.findMany({
      where: { gameId, playerId: userId },
    });

    // Get opponent card count
    const opponentId = game.hostId === userId ? game.guestId : game.hostId;
    const opponentCardCount = opponentId
      ? await this.prisma.gameCard.count({
          where: { gameId, playerId: opponentId, status: 'available' },
        })
      : 0;

    return {
      id: game.id,
      mode: game.mode,
      status: game.status,
      current_turn: game.currentTurn,
      board_state: game.boardState,
      active_effects: game.activeEffects,
      your_cards: userCards,
      opponent_card_count: opponentCardCount,
    };
  }

  async joinRoom(roomCode: string, userId: string) {
    const game = await this.prisma.game.findUnique({
      where: { roomCode },
      include: { host: true, guest: true, cards: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    if (game.mode !== 'online') {
      throw new Error('Cannot join non-online game');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game already started or completed');
    }

    if (game.guestId) {
      throw new Error('Game already has a guest');
    }

    // Assign guest and start game
    await this.prisma.game.update({
      where: { id: game.id },
      data: { guestId: userId, status: 'in_progress' },
    });

    // Assign guest cards
    const guestCards = game.cards.filter((c) => !c.playerId);
    await this.prisma.gameCard.updateMany({
      where: { id: { in: guestCards.map((c) => c.id) } },
      data: { playerId: userId },
    });

    return this.getGame(game.id, userId);
  }

  async executeMove(gameId: string, userId: string, from: string, to: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { host: true, guest: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    // Verify user is a participant
    if (game.hostId !== userId && game.guestId !== userId) {
      throw new Error('Not a participant in this game');
    }

    // Verify it's the user's turn
    const isWhiteTurn = game.currentTurn === 'white';
    const userIsHost = game.hostId === userId;
    const isUserTurn = (isWhiteTurn && userIsHost) || (!isWhiteTurn && !userIsHost);

    if (!isUserTurn) {
      throw new Error('Not your turn');
    }

    if (game.status !== 'in_progress') {
      throw new Error('Game is not in progress');
    }

    // Validate move with chess.js
    const chess = this.chessService.createFromFen(game.boardState);

    if (!this.chessService.isMoveLegal(chess, from, to)) {
      throw new Error('Illegal move');
    }

    // Check for active skip_turn effect on current player
    const activeEffects = game.activeEffects as any[];
    const skipTurnEffect = activeEffects?.find((e) => e.type === 'skip_turn' && e.appliedBy !== userId);

    if (skipTurnEffect && skipTurnEffect.turnsRemaining > 0) {
      // Remove skip effect and switch turn without executing move
      const updatedEffects = activeEffects
        .filter((e) => e.type !== 'skip_turn' || e.appliedBy === userId)
        .map((e) => e.type === 'skip_turn' ? { ...e, turnsRemaining: 0 } : e)
        .filter((e) => e.turnsRemaining > 0);

      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          currentTurn: isWhiteTurn ? 'black' : 'white',
          activeEffects: updatedEffects,
        },
      });

      return this.getGame(gameId, userId);
    }

    // Execute move
    const newFen = this.chessService.executeMove(chess, from, to);
    if (!newFen) {
      throw new Error('Failed to execute move');
    }

    const updatedChess = this.chessService.createFromFen(newFen);
    const newTurn = this.chessService.getTurn(updatedChess) === 'w' ? 'white' : 'black';
    const isCheckmate = this.chessService.isCheckmate(updatedChess);

    // Decrement all active effects by 1 turn
    const updatedEffects = (activeEffects || [])
      .map((e) => ({ ...e, turnsRemaining: Math.max(0, e.turnsRemaining - 1) }))
      .filter((e) => e.turnsRemaining > 0);

    // Record move
    await this.prisma.move.create({
      data: {
        gameId,
        playerId: userId,
        moveNotation: `${from}${to}`,
      },
    });

    // Update game state
    const gameStatus = isCheckmate ? 'completed' : 'in_progress';
    const winnerId = isCheckmate ? userId : null;

    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        boardState: newFen,
        currentTurn: newTurn,
        status: gameStatus,
        winnerId,
        activeEffects: updatedEffects,
      },
    });

    return this.getGame(gameId, userId);
  }

  async useCard(gameId: string, userId: string, cardId: string) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { cards: true },
    });

    if (!game) {
      throw new Error('Game not found');
    }

    const card = game.cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    if (card.playerId !== userId) {
      throw new Error('Card does not belong to you');
    }

    if (card.status !== 'available') {
      throw new Error('Card already used');
    }

    // Mark card as used
    await this.prisma.gameCard.update({
      where: { id: cardId },
      data: { status: 'used', usedAt: new Date() },
    });

    // Add effect based on card type
    const activeEffects = (game.activeEffects as any[]) || [];
    let newEffect: any = null;

    switch (card.cardType) {
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
      // Handle other cards as needed
    }

    if (newEffect) {
      activeEffects.push(newEffect);
    }

    // Update game with new effects
    await this.prisma.game.update({
      where: { id: gameId },
      data: { activeEffects },
    });

    return this.getGame(gameId, userId);
  }
}
