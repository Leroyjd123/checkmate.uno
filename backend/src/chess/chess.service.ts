import { Injectable } from '@nestjs/common';
import { Chess } from 'chess.js';

@Injectable()
export class ChessService {
  /**
   * Creates a new Chess instance from FEN notation
   */
  createFromFen(fen: string): Chess {
    return new Chess(fen);
  }

  /**
   * Creates a new Chess instance with starting position
   */
  createStartingPosition(): Chess {
    return new Chess();
  }

  /**
   * Validates if a move is legal
   */
  isMoveLegal(chess: Chess, from: string, to: string): boolean {
    try {
      const moves = chess.moves({ square: from as any, verbose: true });
      return moves.some((m: any) => m.to === to);
    } catch {
      return false;
    }
  }

  /**
   * Executes a move and returns the new FEN
   */
  executeMove(chess: Chess, from: string, to: string): string | null {
    try {
      const result = chess.move({ from, to });
      if (!result) {
        return null;
      }
      return chess.fen();
    } catch {
      return null;
    }
  }

  /**
   * Gets all legal moves from a position
   */
  getLegalMoves(chess: Chess): string[] {
    return chess.moves({ verbose: true }).map((m) => m.san);
  }

  /**
   * Gets all legal moves with verbose information
   */
  getLegalMovesVerbose(chess: Chess) {
    return chess.moves({ verbose: true });
  }

  /**
   * Checks if position is check
   */
  isInCheck(chess: Chess): boolean {
    return chess.inCheck();
  }

  /**
   * Checks if position is checkmate
   */
  isCheckmate(chess: Chess): boolean {
    return chess.isCheckmate();
  }

  /**
   * Checks if position is stalemate (not used in MVP but available)
   */
  isStalemate(chess: Chess): boolean {
    return chess.isStalemate();
  }

  /**
   * Gets whose turn it is
   */
  getTurn(chess: Chess): 'w' | 'b' {
    return chess.turn();
  }

  /**
   * Gets the current FEN
   */
  getFen(chess: Chess): string {
    return chess.fen();
  }

  /**
   * Gets move history
   */
  getHistory(chess: Chess) {
    return chess.history({ verbose: true });
  }
}
