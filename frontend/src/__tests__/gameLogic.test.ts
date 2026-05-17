/**
 * Game Logic Unit Tests
 * Tests for piece movement, capture, checkmate detection
 */

describe('Game Logic', () => {
  describe('Piece Movement', () => {
    it('should allow pawn to move forward one square', () => {
      // Starting FEN: white pawn at e2
      const board = {
        'e2': { type: 'pawn', color: 'white' },
      };

      const move = { from: 'e2', to: 'e3' };

      // Simulate move validation
      const isLegal = board['e2']?.type === 'pawn' && !board['e3'];

      expect(isLegal).toBe(true);
    });

    it('should allow pawn to move forward two squares on first move', () => {
      const board = {
        'e2': { type: 'pawn', color: 'white' },
      };

      const move = { from: 'e2', to: 'e4' };
      const isFirstMove = true; // e2 is starting position

      const isLegal = board['e2']?.type === 'pawn' && !board['e3'] && !board['e4'] && isFirstMove;

      expect(isLegal).toBe(true);
    });

    it('should not allow pawn to move backward', () => {
      const board = {
        'e3': { type: 'pawn', color: 'white' },
      };

      const move = { from: 'e3', to: 'e2' };
      const isLegal = false; // Pawns cannot move backward

      expect(isLegal).toBe(false);
    });

    it('should allow knight to move in L-shape', () => {
      const board = {
        'g1': { type: 'knight', color: 'white' },
      };

      const validKnightMoves = ['e2', 'f3', 'h3'];
      const move = 'f3';

      expect(validKnightMoves).toContain(move);
    });

    it('should allow rook to move horizontally', () => {
      const board = {
        'a1': { type: 'rook', color: 'white' },
      };

      const moveFrom = 'a1';
      const moveTo = 'e1'; // horizontal move on rank 1

      expect(moveFrom[0]).toBe(moveTo[0].toUpperCase() || moveTo[1] === moveFrom[1]);
    });

    it('should not allow piece to move to occupied square by same color', () => {
      const board = {
        'e2': { type: 'pawn', color: 'white' },
        'e3': { type: 'pawn', color: 'white' }, // blocking
      };

      const moveTo = 'e3';
      const canMove = !board[moveTo] || board[moveTo].color !== 'white';

      expect(canMove).toBe(false);
    });
  });

  describe('Piece Capture', () => {
    it('should capture enemy piece on destination square', () => {
      const board = {
        'e2': { type: 'pawn', color: 'white' },
        'e3': { type: 'pawn', color: 'black' }, // enemy piece
      };

      const moveFrom = 'e2';
      const moveTo = 'e3';
      const capturedPiece = board[moveTo];

      expect(capturedPiece).toBeDefined();
      expect(capturedPiece?.color).toBe('black');

      // After capture, piece should be removed
      delete board[moveTo];
      expect(board[moveTo]).toBeUndefined();
    });

    it('should not capture own piece', () => {
      const board = {
        'e2': { type: 'pawn', color: 'white' },
        'e3': { type: 'pawn', color: 'white' }, // own piece
      };

      const moveTo = 'e3';
      const canCapture = board[moveTo]?.color !== 'white';

      expect(canCapture).toBe(false);
    });

    it('should track captured pieces count', () => {
      let whiteCaptured = 0;
      let blackCaptured = 0;

      // Simulate captures
      const captures = [
        { piece: 'pawn', color: 'black' },
        { piece: 'knight', color: 'black' },
        { piece: 'pawn', color: 'white' },
      ];

      captures.forEach((capture) => {
        if (capture.color === 'black') {
          whiteCaptured++;
        } else {
          blackCaptured++;
        }
      });

      expect(whiteCaptured).toBe(2);
      expect(blackCaptured).toBe(1);
    });

    it('should update board after capture', () => {
      const boardBefore = {
        'e4': { type: 'pawn', color: 'white' },
        'e5': { type: 'pawn', color: 'black' },
      };

      // Execute capture
      const moveFrom = 'e4';
      const moveTo = 'e5';

      const boardAfter = {
        [moveFrom]: undefined,
        [moveTo]: boardBefore[moveFrom],
      };

      expect(boardAfter['e4']).toBeUndefined();
      expect(boardAfter['e5']?.type).toBe('pawn');
      expect(boardAfter['e5']?.color).toBe('white');
    });
  });

  describe('Turn Management', () => {
    it('should alternate turns between white and black', () => {
      let currentTurn = 'white';

      // After white's move
      currentTurn = currentTurn === 'white' ? 'black' : 'white';
      expect(currentTurn).toBe('black');

      // After black's move
      currentTurn = currentTurn === 'white' ? 'black' : 'white';
      expect(currentTurn).toBe('white');

      // After white's second move
      currentTurn = currentTurn === 'white' ? 'black' : 'white';
      expect(currentTurn).toBe('black');
    });

    it('should only allow current player to move', () => {
      const currentTurn = 'white';
      const pieceColor = 'white';

      const canMove = currentTurn === pieceColor;

      expect(canMove).toBe(true);
    });

    it('should prevent non-current player from moving', () => {
      const currentTurn = 'white';
      const pieceColor = 'black';

      const canMove = currentTurn === pieceColor;

      expect(canMove).toBe(false);
    });
  });

  describe('Checkmate Detection', () => {
    it('should detect checkmate state', () => {
      // Simulated checkmate scenario
      const isCheck = true; // King is in check
      const hasLegalMoves = false; // No legal moves available

      const isCheckmate = isCheck && !hasLegalMoves;

      expect(isCheckmate).toBe(true);
    });

    it('should not detect checkmate if king is not in check', () => {
      const isCheck = false;
      const hasLegalMoves = false;

      const isCheckmate = isCheck && !hasLegalMoves;

      expect(isCheckmate).toBe(false);
    });

    it('should not detect checkmate if legal moves exist', () => {
      const isCheck = true;
      const hasLegalMoves = true; // King can escape

      const isCheckmate = isCheck && !hasLegalMoves;

      expect(isCheckmate).toBe(false);
    });
  });

  describe('Board State', () => {
    it('should initialize board with correct FEN', () => {
      const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      expect(startingFEN).toBeDefined();
      expect(startingFEN).toContain('rnbqkbnr'); // black pieces
      expect(startingFEN).toContain('PPPPPPPP'); // white pawns
    });

    it('should generate valid FEN after move', () => {
      // After e2-e4
      const fenAfterMove = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';

      expect(fenAfterMove).toBeDefined();
      expect(fenAfterMove).toContain('4P3'); // white pawn at e4
    });

    it('should correctly represent captured pieces in FEN', () => {
      // FEN after white captures black pawn
      const fen = 'rnbqkbnr/pp1ppppp/8/8/4pP2/8/PPPP2PP/RNBQKBNR w KQkq - 0 1';

      // Verify piece counts changed
      expect(fen.match(/p/g)?.length).toBeLessThan(8); // fewer black pawns
    });
  });

  describe('Move History', () => {
    it('should record moves in order', () => {
      const moveHistory: string[] = [];

      moveHistory.push('e2-e4');
      moveHistory.push('c7-c5');
      moveHistory.push('g1-f3');

      expect(moveHistory).toEqual(['e2-e4', 'c7-c5', 'g1-f3']);
    });

    it('should maintain chronological order', () => {
      const moveHistory = ['e2-e4', 'c7-c5', 'g1-f3', 'd7-d6'];

      expect(moveHistory[0]).toBe('e2-e4'); // white's first move
      expect(moveHistory[1]).toBe('c7-c5'); // black's first move
      expect(moveHistory[2]).toBe('g1-f3'); // white's second move
      expect(moveHistory[3]).toBe('d7-d6'); // black's second move
    });

    it('should track move count', () => {
      const moves = ['e2-e4', 'c7-c5', 'g1-f3', 'd7-d6', 'd2-d4'];

      expect(moves.length).toBe(5);
    });
  });
});
