'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { gamesAPI } from '@/lib/api';
import { getAllPieces, getLegalMoves, makeMove, isCheckmate } from '@/lib/chess';
import { GameOver } from '@/components/GameOver';
import { ChessBoard } from '@/components/ChessBoard';
import { PlayerColor, Game, PowerCard, ActiveEffect, CardType } from '@/types/game';

interface GamePageProps {
  params: Promise<{
    gameId: string;
  }>;
}

export default function GamePage({ params }: GamePageProps) {
  const { gameId } = use(params);
  const {
    game,
    playerCards,
    setLoading,
    setError,
    updateGame,
    incrementMoveCount,
    incrementCardsUsed,
    statistics,
    reset,
    isLoading,
    error,
    executeMoveWithAPI,
    useCardWithAPI,
    initializeGame,
    setOpponentCardCount,
  } = useGame();
  const { isAuthenticated, user } = useAuth();
  const { joinRoom, subscribe } = useWebSocket();
  const [isLoadingGame, setIsLoadingGame] = useState(!game);
  const [pieces, setPieces] = useState<Record<string, { type: string; color: string }>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [cardMessage, setCardMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);

  // Determine player color based on game mode and user role
  // For local games: Always allow both players to move (use turn checking)
  // For online games: Assign color based on host/guest role
  const playerColor: PlayerColor = (() => {
    if (!game) return 'white';
    if (game.mode === 'local') return 'white'; // Local: color is just for display
    if (!user) return 'white'; // Fallback if user not loaded
    // Online: Check if user is host (white) or guest (black)
    return game.host_id === user.id ? 'white' : 'black';
  })();

  // Turn validation:
  // - Local games: Always allow the player whose turn it is to move
  // - Online games: Only allow moves when it's the player's assigned color's turn
  const isPlayerTurn = !game ? false : (game.mode === 'local' ? true : game.current_turn === playerColor);

  // Sync pieces array whenever board state changes
  // Setting state here is necessary to keep pieces in sync with FEN string
  useEffect(() => {
    if (game) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      // Justification: Board piece positions must be re-derived when FEN changes
      setPieces(getAllPieces(game.board_state));
    }
  }, [game]);

  // Load game from API if not in context (e.g., page refresh)
  useEffect(() => {
    if (game) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      // Justification: Mark loading as complete when game context is populated
      setIsLoadingGame(false);
      return;
    }

    const loadGame = async () => {
      try {
        setLoading(true);

        // Only try to fetch from API if it's an online game
        if (!gameId.includes('local')) {
          try {
            const response = await gamesAPI.getGame(gameId);
            const gameData = response.game;

            // Initialize game in context with API response
            const gameState: Game = {
              id: gameData.id,
              mode: gameData.mode,
              status: gameData.status,
              room_code: gameData.room_code,
              board_state: gameData.board_state,
              current_turn: gameData.current_turn as PlayerColor,
              active_effects: gameData.active_effects || [],
              created_at: gameData.created_at || new Date().toISOString(),
              updated_at: gameData.updated_at || new Date().toISOString(),
            };

            // Your cards from API response
            const playerCards: PowerCard[] = response.your_cards.map((card) => ({
              id: card.id,
              game_id: card.game_id || gameData.id,
              player_id: card.player_id || '',
              card_type: card.card_type,
              status: card.status,
            }));

            initializeGame(gameState, playerCards);
            setOpponentCardCount(response.opponent_card_count || 0);
          } catch {
            setError('Game not found');
            return;
          }
        }

        setIsLoadingGame(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load game');
        setIsLoadingGame(false);
      }
    };

    loadGame();
  }, [game, gameId, setLoading, setError, initializeGame, setOpponentCardCount]);

  // Join WebSocket room for online games
  useEffect(() => {
    if (game && game.mode === 'online' && isAuthenticated) {
      joinRoom(gameId);
    }
  }, [game, gameId, isAuthenticated, joinRoom]);

  // Listen for opponent moves and game events
  useEffect(() => {
    if (!game || game.mode !== 'online') return;

    const unsubscribeMoveEvent = subscribe('move_made', (data) => {
      const moveData = data as { board_state?: string; current_turn?: string; active_effects?: ActiveEffect[] };
      if (moveData?.board_state) {
        updateGame({
          ...game,
          board_state: moveData.board_state,
          current_turn: (moveData.current_turn as PlayerColor) || game.current_turn,
          active_effects: moveData.active_effects || game.active_effects,
        });
        setPieces(getAllPieces(moveData.board_state));
      }
    });

    const unsubscribeCardEvent = subscribe('card_used', (data) => {
      const cardData = data as { active_effects?: ActiveEffect[]; board_state?: string };
      if (cardData?.active_effects) {
        updateGame({
          ...game,
          active_effects: cardData.active_effects,
          board_state: cardData.board_state || game.board_state,
        });
      }
    });

    const unsubscribeGameOverEvent = subscribe('game_over', (data) => {
      const gameOverData = data as { winner_id?: string };
      if (gameOverData?.winner_id) {
        setGameOver(true);
        if (!user) {
          console.warn('Cannot determine winner: user not authenticated');
          setWinner('black'); // Default fallback
          return;
        }
        setWinner(gameOverData.winner_id === user.id ? 'white' : 'black');
      }
    });

    return () => {
      unsubscribeMoveEvent();
      unsubscribeCardEvent();
      unsubscribeGameOverEvent();
    };
  }, [game, user?.id, subscribe, updateGame]);

  const handleSquareClick = async (square: string) => {
    if (!game || gameOver || !isPlayerTurn || isLoading) return;

    // If clicking the same square, deselect
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // If a square is already selected and this is a legal move, make the move
    if (selectedSquare && legalMoves.includes(square)) {
      const newFEN = makeMove(game.board_state, selectedSquare, square);
      if (!newFEN) return;

      const nextTurn: PlayerColor = game.current_turn === 'white' ? 'black' : 'white';
      const checkmated = isCheckmate(newFEN);

      // For online games, call the API
      if (game.mode === 'online') {
        try {
          const response = await executeMoveWithAPI(game.id, selectedSquare, square);
          // Update checked/checkmated status from local validation
          if (checkmated) {
            setGameOver(true);
            setWinner(game.current_turn);
          }
          setPieces(getAllPieces(response.board_state));
        } catch {
          // Error already set in context; error display handled by parent
          return;
        }
      } else {
        // For local games, update state directly
        const updatedGame: Game = {
          ...game,
          board_state: newFEN,
          current_turn: nextTurn,
          status: checkmated ? 'completed' : 'in_progress',
          winner_id: checkmated ? user?.id : undefined,
        };

        updateGame(updatedGame);
        incrementMoveCount();
        setPieces(getAllPieces(newFEN));

        if (checkmated) {
          setGameOver(true);
          setWinner(game.current_turn);
        }
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    // Select a piece on the board if it belongs to the current player
    const piece = pieces[square];
    if (piece && piece.color === game.current_turn) {
      setSelectedSquare(square);
      const moves = getLegalMoves(game.board_state, square);
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleCardClick = async (cardId: string, cardType: string) => {
    if (!game || gameOver || !isPlayerTurn || isLoading) return;

    const card = playerCards.find(c => c.id === cardId);
    if (!card || card.status === 'used') return;

    // For online games, call the API
    if (game.mode === 'online') {
      try {
        await useCardWithAPI(game.id, cardId);
        setCardMessage(`${cardType.replace(/_/g, ' ').toUpperCase()} card used!`);
        setTimeout(() => setCardMessage(null), 2000);
      } catch {
        // Error already set in context
        return;
      }
    } else {
      // For local games, just show visual feedback
      incrementCardsUsed();
      setCardMessage(`${cardType.replace(/_/g, ' ').toUpperCase()} card used!`);
      setTimeout(() => setCardMessage(null), 2000);

      // Add card effect to active effects (only for effects that have board persistence)
      const effectTypesWithPersistence = ['shield', 'freeze'];
      if (effectTypesWithPersistence.includes(cardType)) {
        updateGame({
          ...game,
          active_effects: [
            ...game.active_effects,
            {
              type: cardType as CardType,
              piece_square: selectedSquare || '',
              turns_remaining: 3,
            },
          ],
        });
      }
  };

  const handleReplay = () => {
    reset();
    setGameOver(false);
    setWinner(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setCardMessage(null);
    setPieces({});
    setIsLoadingGame(true);
    window.location.reload();
  };

  if (isLoadingGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white mb-4">Game not found</p>
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const durationSeconds = Math.floor((Date.now() - statistics.startTime) / 1000);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-white">
            ♔ Checkmate
          </Link>
          {game.mode === 'online' && game.room_code && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">Room Code</p>
                <p className="text-lg font-bold text-white font-mono">{game.room_code}</p>
              </div>
              <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium">
                Copy
              </button>
            </div>
          )}
          <Link href="/" className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm">
            Leave Game
          </Link>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Toast */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        )}

        {/* Card Message Toast */}
        {cardMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500 text-green-400 rounded-lg">
            <p className="font-semibold">{cardMessage}</p>
          </div>
        )}

        {/* Status Bar */}
        <div className="mb-8 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-slate-400">Game Mode</p>
              <p className="font-semibold text-white capitalize">{game.mode}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <p className="text-sm text-slate-400">Time Elapsed</p>
              <p className="font-semibold text-white">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div>
              <p className="text-sm text-slate-400">Moves</p>
              <p className="font-semibold text-white">{statistics.moveCount}</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-lg font-semibold ${
            isPlayerTurn
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600'
          }`}>
            {isPlayerTurn ? '● Your Turn' : '○ Opponent Turn'}
          </div>
        </div>

        {/* Game Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Chess Board - Takes 3 columns */}
          <div className="lg:col-span-3">
            <ChessBoard
              fen={game.board_state}
              selectedSquare={selectedSquare}
              onSquareClick={handleSquareClick}
              legalMoves={legalMoves}
              currentTurn={game.current_turn as 'white' | 'black'}
              moves={[]}
              capturedPieces={{ white: [], black: [] }}
            />
          </div>

          {/* Right Sidebar - Power Cards & Player Info */}
          <div className="space-y-6">
            {/* Player Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">
                {playerColor === 'white' ? '♔ White (You)' : '♚ Black (You)'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cards Available</span>
                  <span className="font-semibold text-white">{playerCards.filter(c => c.status === 'available').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Cards Used</span>
                  <span className="font-semibold text-white">{playerCards.filter(c => c.status === 'used').length}</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${(playerCards.filter(c => c.status === 'used').length / playerCards.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Power Cards */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-4">Power Cards</h3>
              {cardMessage && (
                <div className="mb-3 p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-sm text-center font-medium">
                  ✓ {cardMessage}
                </div>
              )}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {playerCards.length > 0 ? (
                  playerCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id, card.card_type)}
                      disabled={card.status === 'used' || gameOver || !isPlayerTurn || isLoading}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        card.status === 'used'
                          ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                          : gameOver || !isPlayerTurn || isLoading
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'
                      }`}
                    >
                      {card.card_type.replace(/_/g, ' ')}
                      {card.status === 'used' && ' ✓'}
                    </button>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm text-center py-4">No cards</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Game Over Modal */}
      {gameOver && winner && (
        <GameOver
          winner={winner}
          playerColor={playerColor}
          moveCount={statistics.moveCount}
          cardsUsed={statistics.cardsUsed}
          duration={durationSeconds}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}
