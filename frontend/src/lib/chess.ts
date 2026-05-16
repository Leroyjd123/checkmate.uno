import { Chess, Square } from 'chess.js';
import { PlayerColor } from '@/types/game';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function initializeChess(fen?: string): Chess {
  const game = new Chess();

  if (fen && fen !== STARTING_FEN) {
    game.load(fen);
  }

  return game;
}

export function getChessFromFEN(fen: string): Chess {
  const game = new Chess();
  try {
    game.load(fen);
    return game;
  } catch {
    console.error('Invalid FEN:', fen);
    return initializeChess();
  }
}

export function getLegalMoves(fen: string, square: string): string[] {
  const game = getChessFromFEN(fen);
  const moves = game.moves({ square: square as Square, verbose: true });
  return moves.map(m => m.to);
}

export function isMoveLegal(fen: string, from: string, to: string): boolean {
  const game = getChessFromFEN(fen);
  const moves = game.moves({ square: from as Square, verbose: true });
  return moves.some(m => m.to === to);
}

export function isInCheck(fen: string): boolean {
  const game = getChessFromFEN(fen);
  return game.isCheck();
}

export function isCheckmate(fen: string): boolean {
  const game = getChessFromFEN(fen);
  return game.isCheckmate();
}

export function isStalemate(fen: string): boolean {
  const game = getChessFromFEN(fen);
  return game.isStalemate();
}

export function getPieceAtSquare(fen: string, square: string): string | null {
  const game = getChessFromFEN(fen);
  const piece = game.get(square as Square);
  return piece ? piece.type.toUpperCase() : null;
}

export function getPieceColorAtSquare(fen: string, square: string): PlayerColor | null {
  const game = getChessFromFEN(fen);
  const piece = game.get(square as Square);
  return piece ? (piece.color === 'w' ? 'white' : 'black') : null;
}

export function getCurrentTurn(fen: string): PlayerColor {
  const game = getChessFromFEN(fen);
  return game.turn() === 'w' ? 'white' : 'black';
}

export function makeMove(fen: string, from: string, to: string): string | null {
  const game = getChessFromFEN(fen);

  try {
    game.move({ from, to, promotion: 'q' }); // Pawn promotion to Queen
    return game.fen();
  } catch {
    return null;
  }
}

// Utility to get all pieces on the board
export function getAllPieces(fen: string): Record<string, { type: string; color: PlayerColor }> {
  const game = getChessFromFEN(fen);
  const pieces: Record<string, { type: string; color: PlayerColor }> = {};

  for (let i = 0; i < 64; i++) {
    const square = String.fromCharCode((i % 8) + 97) + (Math.floor(i / 8) + 1);
    const piece = game.get(square as Square);

    if (piece) {
      pieces[square] = {
        type: piece.type.toUpperCase(),
        color: piece.color === 'w' ? 'white' : 'black',
      };
    }
  }

  return pieces;
}

// Convert piece type to Unicode symbol
export function getPieceSymbol(type: string, color: PlayerColor): string {
  const symbolMap: Record<string, Record<PlayerColor, string>> = {
    K: { white: '♔', black: '♚' },
    Q: { white: '♕', black: '♛' },
    R: { white: '♖', black: '♜' },
    B: { white: '♗', black: '♝' },
    N: { white: '♘', black: '♞' },
    P: { white: '♙', black: '♟' },
  };

  return symbolMap[type]?.[color] || '';
}

// Utility to get all squares in algebraic notation
export function getAllSquares(): string[] {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const squares: string[] = [];

  for (const rank of ranks) {
    for (const file of files) {
      squares.push(file + rank);
    }
  }

  return squares;
}

// Convert square notation to board coordinates (0-63)
export function squareToIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // a=0, b=1, etc
  const rank = parseInt(square[1]) - 1; // 1=0, 2=1, etc
  return rank * 8 + file;
}

// Convert board index (0-63) to square notation
export function indexToSquare(index: number): string {
  const file = String.fromCharCode((index % 8) + 97);
  const rank = Math.floor(index / 8) + 1;
  return file + rank;
}

// Utility to check if a square is light or dark
export function isLightSquare(square: string): boolean {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return (file + rank) % 2 === 0;
}
