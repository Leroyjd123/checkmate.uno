'use client';

import { BoardTheme, getTheme, DEFAULT_THEME } from '@/lib/board-themes';

interface ChessBoardProps {
  fen?: string;
  onSquareClick?: (square: string) => void;
  selectedSquare?: string | null;
  legalMoves?: string[];
  moves?: Array<{ from: string; to: string; piece?: string }>;
  capturedPieces?: { white: string[]; black: string[] };
  currentTurn?: 'white' | 'black';
  theme?: BoardTheme;
  activeAnimation?: string | null;
  animatingSquares?: string[];
}

const pieceNames: Record<string, string> = {
  'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn',
  'k': 'King', 'q': 'Queen', 'r': 'Rook', 'b': 'Bishop', 'n': 'Knight', 'p': 'Pawn',
};

export function ChessBoard({
  fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  onSquareClick,
  selectedSquare,
  legalMoves = [],
  moves = [],
  capturedPieces = { white: [], black: [] },
  currentTurn = 'white',
  theme = DEFAULT_THEME,
  activeAnimation = null,
  animatingSquares = [],
}: ChessBoardProps) {
  const themeConfig = getTheme(theme);
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const getPieceAtSquare = (file: string, rank: string): string | null => {
    const fenParts = fen.split(' ');
    const boardPart = fenParts[0];
    const rows = boardPart.split('/');
    const rankIndex = 8 - parseInt(rank);
    const row = rows[rankIndex];

    let fileIndex = 0;
    for (const char of row) {
      if (isNaN(Number(char))) {
        if (fileIndex === files.indexOf(file)) {
          return char;
        }
        fileIndex++;
      } else {
        fileIndex += Number(char);
      }
    }
    return null;
  };

  const isLightSquare = (file: string, rank: string): boolean => {
    const fileCode = file.charCodeAt(0) - 97;
    const rankCode = parseInt(rank) - 1;
    return (fileCode + rankCode) % 2 === 0;
  };

  const squareSize = 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16';
  const labelSize = 'text-xs sm:text-sm';
  const pieceSize = 'text-2xl sm:text-3xl md:text-4xl';
  const labelPaddingX = 'px-2 sm:px-3';

  return (
    <div className={`flex flex-col lg:flex-row gap-4 lg:gap-8 ${themeConfig.boardBg} text-white p-4 sm:p-6 lg:p-8 rounded-2xl ${themeConfig.boardBorder} border-2 overflow-x-auto lg:overflow-visible`}>
      {/* Chess Board */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {/* File Labels */}
        <div className="flex gap-1 ml-6 sm:ml-8">
          {files.map((file) => (
            <div key={`file-${file}`} className={`${squareSize.split(' ')[0]} h-6 flex items-center justify-center ${labelSize} font-semibold ${themeConfig.labelColor}`}>
              {file}
            </div>
          ))}
        </div>

        {/* Board */}
        <div className={`border-2 ${themeConfig.boardBorder} ${themeConfig.boardBg} inline-block`}>
          {ranks.map((rank) => (
            <div key={rank} className="flex gap-1">
              {/* Rank Label */}
              <div className={`w-6 sm:w-7 flex items-center justify-center text-xs sm:text-sm font-semibold ${themeConfig.labelColor}`}>
                {rank}
              </div>

              {/* Squares */}
              {files.map((file) => {
                const square = `${file}${rank}`;
                const isLight = isLightSquare(file, rank);
                const piece = getPieceAtSquare(file, rank);
                const isSelected = selectedSquare === square;
                const isLegal = legalMoves.includes(square);
                const isAnimating = animatingSquares.includes(square);

                // Determine animation class based on card type
                let animationClass = '';
                if (isAnimating && activeAnimation) {
                  const animationMap: Record<string, string> = {
                    'freeze': 'animate-freeze-sparkle',
                    'shield': 'animate-shield-protect',
                    'reverse_move': 'animate-reverse-flip',
                    'teleport': 'animate-teleport-warp',
                    'sacrifice': 'animate-sacrifice-fade',
                    'skip_turn': 'animate-skip-pulse',
                    'extra_move': 'animate-extra-glow',
                  };
                  animationClass = animationMap[activeAnimation] || '';
                }

                return (
                  <button
                    key={square}
                    onClick={() => onSquareClick?.(square)}
                    className={`
                      ${squareSize} flex items-center justify-center ${pieceSize} font-bold
                      transition-all duration-150 cursor-pointer
                      ${isLight ? themeConfig.light.bg : themeConfig.dark.bg}
                      ${isSelected ? themeConfig.selected : ''}
                      ${isLegal ? themeConfig.legal : ''}
                      ${themeConfig.hoverEffect}
                      ${animationClass}
                    `}
                    title={`${square}${piece ? ` - ${pieceNames[piece]}` : ''}`}
                  >
                    {piece && (
                      <span className={piece === piece.toLowerCase() ? themeConfig.pieces.blackPieceColor : themeConfig.pieces.whitePieceColor}>
                        {themeConfig.pieces.symbols[piece]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-64 flex-shrink-0">
        {/* Current Turn */}
        <div className={`${themeConfig.dark.bg} border-2 ${themeConfig.boardBorder} rounded-xl p-3 sm:p-4`}>
          <p className={`${themeConfig.labelColor} text-xs sm:text-sm mb-2`}>Current Turn</p>
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                currentTurn === 'white' ? 'bg-white' : 'bg-gray-400'
              }`}
            />
            <p className="text-base sm:text-lg font-semibold capitalize text-white">
              {currentTurn === 'white' ? 'White' : 'Black'}
            </p>
          </div>
        </div>

        {/* Captured Pieces */}
        <div className="space-y-3 sm:space-y-4">
          {/* White Captured */}
          <div className={`${themeConfig.dark.bg} border-2 ${themeConfig.boardBorder} rounded-xl p-3 sm:p-4`}>
            <p className={`${themeConfig.labelColor} text-xs sm:text-sm mb-2`}>White Captured</p>
            <div className="flex flex-wrap gap-2 min-h-8">
              {capturedPieces.white && capturedPieces.white.length > 0 ? (
                capturedPieces.white.map((piece, idx) => (
                  <span key={idx} className={`text-lg sm:text-xl ${piece === piece.toLowerCase() ? themeConfig.pieces.blackPieceColor : themeConfig.pieces.whitePieceColor}`}>
                    {themeConfig.pieces.symbols[piece]}
                  </span>
                ))
              ) : (
                <span className={`${themeConfig.labelColor} opacity-50 text-xs sm:text-sm`}>None</span>
              )}
            </div>
          </div>

          {/* Black Captured */}
          <div className={`${themeConfig.dark.bg} border-2 ${themeConfig.boardBorder} rounded-xl p-3 sm:p-4`}>
            <p className={`${themeConfig.labelColor} text-xs sm:text-sm mb-2`}>Black Captured</p>
            <div className="flex flex-wrap gap-2 min-h-8">
              {capturedPieces.black && capturedPieces.black.length > 0 ? (
                capturedPieces.black.map((piece, idx) => (
                  <span key={idx} className={`text-lg sm:text-xl ${piece === piece.toLowerCase() ? themeConfig.pieces.blackPieceColor : themeConfig.pieces.whitePieceColor}`}>
                    {themeConfig.pieces.symbols[piece]}
                  </span>
                ))
              ) : (
                <span className={`${themeConfig.labelColor} opacity-50 text-xs sm:text-sm`}>None</span>
              )}
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className={`${themeConfig.dark.bg} border-2 ${themeConfig.boardBorder} rounded-xl p-3 sm:p-4`}>
          <p className={`${themeConfig.labelColor} text-xs sm:text-sm mb-3`}>Move History</p>
          <div className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto">
            {moves && moves.length > 0 ? (
              moves.map((move, idx) => (
                <div
                  key={idx}
                  className={`text-xs sm:text-sm text-white flex gap-2 pb-2 border-b ${themeConfig.boardBorder} last:border-0`}
                >
                  <span className={`${themeConfig.labelColor} font-semibold`}>{idx + 1}.</span>
                  {move.piece && <span className={move.piece === move.piece.toLowerCase() ? themeConfig.pieces.blackPieceColor : themeConfig.pieces.whitePieceColor}>{themeConfig.pieces.symbols[move.piece]}</span>}
                  <span className={themeConfig.labelColor}>{move.from}</span>
                  <span className={`${themeConfig.labelColor} opacity-60`}>→</span>
                  <span className={`${themeConfig.legal} font-semibold`}>{move.to}</span>
                </div>
              ))
            ) : (
              <p className={`${themeConfig.labelColor} opacity-50 text-xs sm:text-sm`}>No moves yet</p>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className={`${themeConfig.light.bg} ${themeConfig.light.text} border-2 ${themeConfig.boardBorder} rounded-xl p-3 sm:p-4`}>
          <p className="text-xs sm:text-sm font-medium">
            ♟ {legalMoves.length} legal moves available
          </p>
        </div>
      </div>
    </div>
  );
}
