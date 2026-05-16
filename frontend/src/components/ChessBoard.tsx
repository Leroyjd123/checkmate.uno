'use client';

interface ChessBoardProps {
  fen?: string;
  onSquareClick?: (square: string) => void;
  selectedSquare?: string | null;
  legalMoves?: string[];
  moves?: Array<{ from: string; to: string; piece: string }>;
  capturedPieces?: { white: string[]; black: string[] };
  currentTurn?: 'white' | 'black';
}

const pieces: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

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
}: ChessBoardProps) {
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

  return (
    <div className="flex gap-8 bg-slate-950 text-white p-8 rounded-2xl border border-slate-800">
      {/* Chess Board */}
      <div className="flex flex-col gap-1">
        {/* File Labels */}
        <div className="flex gap-1 ml-8">
          {files.map((file) => (
            <div key={`file-${file}`} className="w-14 h-6 flex items-center justify-center text-sm font-semibold text-slate-400">
              {file}
            </div>
          ))}
        </div>

        {/* Board */}
        <div className="border-2 border-slate-700 bg-slate-900">
          {ranks.map((rank) => (
            <div key={rank} className="flex gap-1">
              {/* Rank Label */}
              <div className="w-6 h-14 flex items-center justify-center text-sm font-semibold text-slate-400">
                {rank}
              </div>

              {/* Squares */}
              {files.map((file) => {
                const square = `${file}${rank}`;
                const isLight = isLightSquare(file, rank);
                const piece = getPieceAtSquare(file, rank);
                const isSelected = selectedSquare === square;
                const isLegal = legalMoves.includes(square);

                return (
                  <button
                    key={square}
                    onClick={() => onSquareClick?.(square)}
                    className={`
                      w-14 h-14 flex items-center justify-center text-4xl font-bold
                      transition-all duration-150 cursor-pointer
                      ${isLight ? 'bg-slate-200' : 'bg-slate-700'}
                      ${isSelected ? 'ring-4 ring-yellow-400 ring-inset' : ''}
                      ${isLegal ? 'ring-2 ring-green-400 ring-inset' : ''}
                      hover:brightness-110
                    `}
                    title={`${square}${piece ? ` - ${pieceNames[piece]}` : ''}`}
                  >
                    {piece && pieces[piece]}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Game Info Panel */}
      <div className="flex flex-col gap-6 min-w-64">
        {/* Current Turn */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-2">Current Turn</p>
          <div className="flex items-center gap-3">
            <div
              className={`w-4 h-4 rounded-full ${
                currentTurn === 'white' ? 'bg-white' : 'bg-slate-700'
              }`}
            />
            <p className="text-lg font-semibold capitalize">
              {currentTurn === 'white' ? 'White' : 'Black'}
            </p>
          </div>
        </div>

        {/* Captured Pieces */}
        <div className="space-y-4">
          {/* White Captured */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">White Captured</p>
            <div className="flex flex-wrap gap-2 min-h-8">
              {capturedPieces.white && capturedPieces.white.length > 0 ? (
                capturedPieces.white.map((piece, idx) => (
                  <span key={idx} className="text-xl">
                    {pieces[piece]}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">None</span>
              )}
            </div>
          </div>

          {/* Black Captured */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">Black Captured</p>
            <div className="flex flex-wrap gap-2 min-h-8">
              {capturedPieces.black && capturedPieces.black.length > 0 ? (
                capturedPieces.black.map((piece, idx) => (
                  <span key={idx} className="text-xl">
                    {pieces[piece]}
                  </span>
                ))
              ) : (
                <span className="text-slate-500 text-sm">None</span>
              )}
            </div>
          </div>
        </div>

        {/* Move History */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-3">Move History</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {moves && moves.length > 0 ? (
              moves.map((move, idx) => (
                <div
                  key={idx}
                  className="text-sm text-slate-300 flex gap-2 pb-2 border-b border-slate-700 last:border-0"
                >
                  <span className="text-slate-500 font-semibold">{idx + 1}.</span>
                  <span>{pieces[move.piece]}</span>
                  <span className="text-slate-400">{move.from}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-green-400 font-semibold">{move.to}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No moves yet</p>
            )}
          </div>
        </div>

        {/* Game Status */}
        <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-300 text-sm font-medium">
            ♟ {legalMoves.length} legal moves available
          </p>
        </div>
      </div>
    </div>
  );
}
