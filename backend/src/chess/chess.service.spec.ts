import { Test, TestingModule } from '@nestjs/testing';
import { ChessService } from './chess.service';

describe('ChessService', () => {
  let service: ChessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChessService],
    }).compile();

    service = module.get<ChessService>(ChessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStartingPosition', () => {
    it('should create a chess game at starting position', () => {
      const chess = service.createStartingPosition();
      expect(chess).toBeDefined();
      expect(service.getFen(chess)).toContain('rnbqkbnr');
    });
  });

  describe('createFromFen', () => {
    it('should create a chess game from FEN notation', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
      const chess = service.createFromFen(fen);
      expect(service.getFen(chess)).toBe(fen);
    });

    it('should handle custom FEN positions', () => {
      const fen = '8/8/4k3/8/8/4K3/8/8 w - - 0 1';
      const chess = service.createFromFen(fen);
      expect(service.getFen(chess)).toContain('4k3');
    });
  });

  describe('isMoveLegal', () => {
    it('should validate a legal pawn move', () => {
      const chess = service.createStartingPosition();
      expect(service.isMoveLegal(chess, 'e2', 'e4')).toBe(true);
    });

    it('should reject an illegal pawn move', () => {
      const chess = service.createStartingPosition();
      expect(service.isMoveLegal(chess, 'e2', 'e5')).toBe(false);
    });

    it('should reject moving a piece to an occupied square (own piece)', () => {
      const chess = service.createStartingPosition();
      expect(service.isMoveLegal(chess, 'e2', 'd1')).toBe(false);
    });

    it('should validate a legal knight move', () => {
      const chess = service.createStartingPosition();
      expect(service.isMoveLegal(chess, 'g1', 'f3')).toBe(true);
    });

    it('should reject moving from an empty square', () => {
      const chess = service.createStartingPosition();
      expect(service.isMoveLegal(chess, 'e4', 'e5')).toBe(false);
    });
  });

  describe('executeMove', () => {
    it('should execute a legal move and return new FEN', () => {
      const chess = service.createStartingPosition();
      const newFen = service.executeMove(chess, 'e2', 'e4');
      expect(newFen).toBeDefined();
      expect(newFen).toContain('4P3');
    });

    it('should reject an illegal move', () => {
      const chess = service.createStartingPosition();
      const result = service.executeMove(chess, 'e2', 'e5');
      expect(result).toBeNull();
    });

    it('should update the turn after a move', () => {
      const chess = service.createStartingPosition();
      expect(service.getTurn(chess)).toBe('w');

      const newFen = service.executeMove(chess, 'e2', 'e4');
      const newChess = service.createFromFen(newFen!);
      expect(service.getTurn(newChess)).toBe('b');
    });

    it('should handle capture moves', () => {
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      const chess = service.createFromFen(fen);
      const newFen = service.executeMove(chess, 'd7', 'd5');
      expect(newFen).toBeDefined();
    });
  });

  describe('getLegalMoves', () => {
    it('should return legal moves from starting position', () => {
      const chess = service.createStartingPosition();
      const moves = service.getLegalMoves(chess);
      expect(moves.length).toBe(20); // 16 pawn moves + 4 knight moves
    });

    it('should return empty array when no moves available (stalemate/checkmate)', () => {
      const fen = '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1'; // Stalemate
      const chess = service.createFromFen(fen);
      const moves = service.getLegalMoves(chess);
      expect(moves.length).toBe(0);
    });
  });

  describe('isInCheck', () => {
    it('should detect check', () => {
      const fen = '6k1/5Q2/6K1/8/8/8/8/8 b - - 0 1';
      const chess = service.createFromFen(fen);
      expect(service.isInCheck(chess)).toBe(true);
    });

    it('should return false when not in check', () => {
      const chess = service.createStartingPosition();
      expect(service.isInCheck(chess)).toBe(false);
    });
  });

  describe('isCheckmate', () => {
    it('should detect checkmate', () => {
      // Fool's mate: 1. f3 e5 2. g4 Qh4#
      const fen = 'rnbqkbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 3';
      const chess = service.createFromFen(fen);
      expect(service.isCheckmate(chess)).toBe(true);
    });

    it('should return false when not checkmate', () => {
      const chess = service.createStartingPosition();
      expect(service.isCheckmate(chess)).toBe(false);
    });

    it('should return false when in check but has legal moves', () => {
      const fen = '6k1/5Q2/6K1/8/8/1r6/8/8 b - - 0 1'; // Check but black can move rook
      const chess = service.createFromFen(fen);
      expect(service.isCheckmate(chess)).toBe(false);
    });
  });

  describe('getTurn', () => {
    it('should return white turn at start', () => {
      const chess = service.createStartingPosition();
      expect(service.getTurn(chess)).toBe('w');
    });

    it('should return black turn after a move', () => {
      const chess = service.createStartingPosition();
      const newFen = service.executeMove(chess, 'e2', 'e4')!;
      const newChess = service.createFromFen(newFen);
      expect(service.getTurn(newChess)).toBe('b');
    });
  });

  describe('getFen', () => {
    it('should return the current FEN position', () => {
      const chess = service.createStartingPosition();
      const fen = service.getFen(chess);
      expect(fen).toContain('rnbqkbnr');
      expect(fen).toContain('w');
    });

    it('should return updated FEN after a move', () => {
      const chess = service.createStartingPosition();
      const newFen = service.executeMove(chess, 'e2', 'e4')!;
      expect(newFen).toContain('4P3');
    });
  });

  describe('getHistory', () => {
    it('should return empty history at starting position', () => {
      const chess = service.createStartingPosition();
      const history = service.getHistory(chess);
      expect(history.length).toBe(0);
    });

    it('should track move history', () => {
      const chess = service.createStartingPosition();
      service.executeMove(chess, 'e2', 'e4');
      // Note: this is testing the same chess object that was mutated
      // In real usage, you'd create a new Chess instance from FEN
      const history = service.getHistory(chess);
      expect(history.length).toBe(1);
      expect(history[0].san).toBe('e4');
    });
  });
});
