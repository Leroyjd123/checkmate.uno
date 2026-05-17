'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useBoardTheme } from '@/contexts/BoardThemeContext';
import { gamesAPI } from '@/lib/api';
import { getAllPieces, getLegalMoves, makeMove, isCheckmate, getComputerMove, getAllSquares } from '@/lib/chess';
import { GameOver } from '@/components/GameOver';
import { ChessBoard } from '@/components/ChessBoard';
import { ThemeSelector } from '@/components/ThemeSelector';
import { PlayerColor, Game, PowerCard, ActiveEffect, CardType } from '@/types/game';
import { Logger } from '@/lib/logger';

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
    addMoveToHistory,
    addCapturedPiece,
    markCardAsUsed,
  } = useGame();
  const { isAuthenticated, user } = useAuth();
  const { joinRoom, subscribe } = useWebSocket();
  const { boardTheme, setBoardTheme } = useBoardTheme();
  const [isLoadingGame, setIsLoadingGame] = useState(!game);
  const [pieces, setPieces] = useState<Record<string, { type: string; color: string }>>({});
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [cardMessage, setCardMessage] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [previousGameState, setPreviousGameState] = useState<Game | null>(null);
  const [skipComputerMove, setSkipComputerMove] = useState(false);
  const [allowExtraMove, setAllowExtraMove] = useState(false);
  const [activeAnimation, setActiveAnimation] = useState<CardType | null>(null);
  const [animatingSquares, setAnimatingSquares] = useState<string[]>([]);

  // Determine player color based on game mode and user role
  // For local games: Always allow both players to move (use turn checking)
  // For computer games: Use player_color field if available, otherwise default to white
  // For online games: Assign color based on host/guest role
  const playerColor: PlayerColor = (() => {
    if (!game) return 'white';
    if (game.mode === 'computer') return game.player_color || 'white';
    if (game.mode === 'local') return 'white'; // Local: color is just for display
    if (!user) return 'white'; // Fallback if user not loaded
    // Online: Check if user is host (white) or guest (black)
    return game.host_id === user.id ? 'white' : 'black';
  })();

  // Turn validation:
  // - Local games: Player can move on their turn (playerColor is white)
  // - Computer games: Player can move when it's white's turn
  // - Online games: Only allow moves when it's the player's assigned color's turn
  const isPlayerTurn = !game ? false : game.current_turn === playerColor;

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
      Logger.gameStart({ mode: game.mode, gameId: game.id });
      return;
    }

    const loadGame = async () => {
      try {
        setLoading(true);

        // Only try to fetch from API if it's an online game (skip local and computer games)
        if (!gameId.includes('local') && !gameId.includes('computer')) {
          try {
            Logger.apiCall('GET', `/games/${gameId}`);
            const response = await gamesAPI.getGame(gameId);
            Logger.apiSuccess('GET', `/games/${gameId}`, { mode: response.game.mode, status: response.game.status });
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

            Logger.contextUpdate('GameContext', { gameId: gameState.id, cardCount: playerCards.length });
            initializeGame(gameState, playerCards);
            setOpponentCardCount(response.opponent_card_count || 0);
          } catch (err) {
            Logger.apiError('GET', `/games/${gameId}`, err);
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

  // Handle computer's first move if computer is white
  useEffect(() => {
    if (!game || game.mode !== 'computer' || playerColor !== 'black' || statistics.moveCount !== 0 || gameOver) return;
    if (game.current_turn !== 'white') return;

    const timer = setTimeout(() => {
      const computerMoveStr = getComputerMove(game.board_state);
      if (computerMoveStr && computerMoveStr.length === 4) {
        const computerFrom = computerMoveStr.substring(0, 2);
        const computerTo = computerMoveStr.substring(2, 4);
        const computerPieces = getAllPieces(game.board_state);
        const computerCapturedPiece = computerPieces[computerTo];
        const computerFEN = makeMove(game.board_state, computerFrom, computerTo);

        if (computerFEN) {
          Logger.gameMove(computerFrom, computerTo, {
            player: 'computer',
            captured: computerCapturedPiece?.type,
            firstMove: true,
          });

          if (computerCapturedPiece) {
            const capturedColor = computerCapturedPiece.color === 'black' ? 'white' : 'black';
            addCapturedPiece(computerCapturedPiece.type, capturedColor);
          }

          const computerCheckmated = isCheckmate(computerFEN);
          const computerUpdatedGame: Game = {
            ...game,
            board_state: computerFEN,
            current_turn: 'white',
            status: computerCheckmated ? 'completed' : 'in_progress',
            winner_id: computerCheckmated ? 'computer' : undefined,
          };

          updateGame(computerUpdatedGame);
          incrementMoveCount();
          addMoveToHistory(computerFrom, computerTo);
          setPieces(getAllPieces(computerFEN));

          if (computerCheckmated) {
            Logger.gameCheckmate();
            setGameOver(true);
            setWinner('black');
          }
        }
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [game, playerColor, statistics.moveCount, gameOver, addMoveToHistory, addCapturedPiece, updateGame, incrementMoveCount, setGameOver, setWinner]);

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
        Logger.gameMove('opponent', 'executed', {
          turn: moveData.current_turn,
          effectsActive: moveData.active_effects?.length,
        });
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
        Logger.cardEffect('opponent_card', `active effects count: ${cardData.active_effects.length}`);
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
        if (!user) {
          Logger.error('game_over received but user not authenticated');
          setWinner('black');
          return;
        }
        const winnerColor = gameOverData.winner_id === user.id ? 'white' : 'black';
        Logger.gameEnd(winnerColor, { winner_id: gameOverData.winner_id });
        setGameOver(true);
        setWinner(winnerColor);
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
      const movedPiece = pieces[selectedSquare];
      const capturedPiece = pieces[square];
      const newFEN = makeMove(game.board_state, selectedSquare, square);
      if (!newFEN) return;

      // Log the move
      Logger.gameMove(selectedSquare, square, {
        piece: movedPiece?.type,
        captured: capturedPiece?.type,
        mode: game.mode,
      });

      const nextTurn: PlayerColor = game.current_turn === 'white' ? 'black' : 'white';
      const checkmated = isCheckmate(newFEN);

      // Track move and captured pieces
      const move = {
        from: selectedSquare,
        to: square,
        piece: movedPiece?.type || '',
      };

      // Save previous game state for reverse_move card
      setPreviousGameState(game);

      // If a piece was captured, track it
      if (capturedPiece) {
        const capturedColor = capturedPiece.color === 'black' ? 'white' : 'black';
        addCapturedPiece(capturedPiece.type, capturedColor);
      }

      // For online games, call the API
      if (game.mode === 'online') {
        try {
          Logger.apiCall('POST', `/games/${game.id}/moves`);
          const response = await executeMoveWithAPI(game.id, selectedSquare, square);
          Logger.apiSuccess('POST', `/games/${game.id}/moves`, { board_state: response.board_state });
          // Update checked/checkmated status from local validation
          if (checkmated) {
            Logger.gameCheckmate();
            setGameOver(true);
            setWinner(game.current_turn);
          }
          setPieces(getAllPieces(response.board_state));
        } catch (err) {
          Logger.apiError('POST', `/games/${game.id}/moves`, err);
          // Error already set in context; error display handled by parent
          return;
        }
      } else {
        // For local and computer games, update state directly
        const updatedGame: Game = {
          ...game,
          board_state: newFEN,
          current_turn: nextTurn,
          status: checkmated ? 'completed' : 'in_progress',
          winner_id: checkmated ? user?.id : undefined,
        };

        updateGame(updatedGame);
        incrementMoveCount();
        addMoveToHistory(selectedSquare, square);
        setPieces(getAllPieces(newFEN));

        if (checkmated) {
          Logger.gameCheckmate();
          setGameOver(true);
          setWinner(game.current_turn);
        }

        // Computer move - only if computer's turn and game not over and skip_turn isn't active
        if (game.mode === 'computer' && !checkmated && nextTurn === 'black' && !skipComputerMove) {
          setTimeout(() => {
            const computerMoveStr = getComputerMove(newFEN);
            if (computerMoveStr && computerMoveStr.length === 4) {
              const computerFrom = computerMoveStr.substring(0, 2);
              const computerTo = computerMoveStr.substring(2, 4);
              const computerPieces = getAllPieces(newFEN);
              const computerCapturedPiece = computerPieces[computerTo];
              const computerFEN = makeMove(newFEN, computerFrom, computerTo);

              if (computerFEN) {
                Logger.gameMove(computerFrom, computerTo, {
                  player: 'computer',
                  captured: computerCapturedPiece?.type,
                });

                // Track computer captured piece
                if (computerCapturedPiece) {
                  const capturedColor = computerCapturedPiece.color === 'black' ? 'white' : 'black';
                  addCapturedPiece(computerCapturedPiece.type, capturedColor);
                }

                const computerCheckmated = isCheckmate(computerFEN);
                const computerUpdatedGame: Game = {
                  ...updatedGame,
                  board_state: computerFEN,
                  current_turn: 'white',
                  status: computerCheckmated ? 'completed' : 'in_progress',
                  winner_id: computerCheckmated ? 'computer' : undefined,
                };

                updateGame(computerUpdatedGame);
                incrementMoveCount();
                addMoveToHistory(computerFrom, computerTo);
                setPieces(getAllPieces(computerFEN));

                if (computerCheckmated) {
                  Logger.gameCheckmate();
                  setGameOver(true);
                  setWinner('black');
                }
              }
            } else if (skipComputerMove) {
              // Computer's turn was skipped, reset the flag and make it white's turn again
              Logger.action('skip_turn card prevented computer move');
              setSkipComputerMove(false);
              const gameAfterSkip: Game = {
                ...updatedGame,
                current_turn: 'white',
              };
              updateGame(gameAfterSkip);
            }
          }, 800); // Delay computer move for better UX
        } else if (skipComputerMove) {
          // Computer's turn was skipped
          setSkipComputerMove(false);
          const gameAfterSkip: Game = {
            ...updatedGame,
            current_turn: 'white',
          };
          updateGame(gameAfterSkip);
        }
      }

      // If extra_move is active, allow another move without changing turns
      if (allowExtraMove) {
        setAllowExtraMove(false);
        setSelectedSquare(null);
        setLegalMoves([]);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
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
        Logger.apiCall('POST', `/games/${game.id}/cards/${cardId}/use`);
        await useCardWithAPI(game.id, cardId);
        Logger.apiSuccess('POST', `/games/${game.id}/cards/${cardId}/use`, { cardType });
        setCardMessage(`${cardType.replace(/_/g, ' ').toUpperCase()} card used!`);
        setTimeout(() => setCardMessage(null), 2000);
      } catch (err) {
        Logger.apiError('POST', `/games/${game.id}/cards/${cardId}/use`, err);
        // Error already set in context
        return;
      }
    } else {
      // For local games, apply card effects
      Logger.cardUsed(cardType, selectedSquare || undefined);
      markCardAsUsed(cardId);
      incrementCardsUsed();
      setCardMessage(`${cardType.replace(/_/g, ' ').toUpperCase()} card used!`);
      setTimeout(() => setCardMessage(null), 2000);

      // Apply card effects based on type
      setActiveAnimation(cardType as CardType);
      setTimeout(() => setActiveAnimation(null), 1500);

      switch (cardType) {
        case 'skip_turn':
          Logger.cardEffect(cardType, 'opponent turn skipped for next turn');
          Logger.stateChange('skip_turn', 'activated', skipComputerMove, true);
          setSkipComputerMove(true);
          break;

        case 'extra_move':
          Logger.cardEffect(cardType, 'granted extra move without turn change');
          Logger.stateChange('extra_move', 'activated', allowExtraMove, true);
          setAllowExtraMove(true);
          break;

        case 'reverse_move':
          if (previousGameState) {
            Logger.cardEffect(cardType, `undoing move from ${previousGameState.board_state}`);
            setAnimatingSquares([selectedSquare || ''].filter(Boolean));
            updateGame(previousGameState);
            setPieces(getAllPieces(previousGameState.board_state));
            Logger.stateChange('board_state', 'reverted to previous state');
            setTimeout(() => setAnimatingSquares([]), 1200);
          } else {
            Logger.warning('reverse_move card used but no previous game state available');
          }
          break;

        case 'freeze':
          if (selectedSquare) {
            Logger.cardEffect(cardType, `freezing piece at ${selectedSquare} for 3 turns`);
            setAnimatingSquares([selectedSquare]);
            updateGame({
              ...game,
              active_effects: [
                ...game.active_effects,
                {
                  type: cardType,
                  piece_square: selectedSquare,
                  turns_remaining: 3,
                  metadata: {
                    playedBy: 'white',
                    appliedAt: new Date().toISOString(),
                  },
                },
              ],
            });
            Logger.stateChange('active_effects', 'freeze effect added', undefined, selectedSquare);
            setTimeout(() => setAnimatingSquares([]), 1000);
          } else {
            Logger.warning('freeze card used but no square selected');
          }
          break;

        case 'shield':
          if (selectedSquare) {
            Logger.cardEffect(cardType, `protecting piece at ${selectedSquare} for 3 turns`);
            setAnimatingSquares([selectedSquare]);
            updateGame({
              ...game,
              active_effects: [
                ...game.active_effects,
                {
                  type: cardType,
                  piece_square: selectedSquare,
                  turns_remaining: 3,
                  metadata: {
                    playedBy: 'white',
                    appliedAt: new Date().toISOString(),
                  },
                },
              ],
            });
            Logger.stateChange('active_effects', 'shield effect added', undefined, selectedSquare);
            setTimeout(() => setAnimatingSquares([]), 1000);
          } else {
            Logger.warning('shield card used but no square selected');
          }
          break;

        case 'teleport':
          if (selectedSquare) {
            Logger.cardEffect(cardType, `enabling teleport from ${selectedSquare} to any square`);
            setAnimatingSquares([selectedSquare]);
            setCardMessage('Select target square for teleport');
            setLegalMoves(getAllSquares());
            Logger.stateChange('legal_moves', 'all squares enabled for teleport');
            setTimeout(() => setAnimatingSquares([]), 800);
          } else {
            Logger.warning('teleport card used but no source square selected');
          }
          break;

        case 'wild_swap':
          Logger.cardEffect(cardType, 'initiating two-piece swap - awaiting target selection');
          setCardMessage('Select two pieces to swap');
          Logger.stateChange('card_state', 'waiting for swap target selection');
          break;

        case 'sacrifice':
          if (selectedSquare) {
            Logger.cardEffect(cardType, `sacrificing own piece at ${selectedSquare}`);
            setAnimatingSquares([selectedSquare]);
            const newFEN = game.board_state
              .split(' ')
              .map((part, idx) => {
                if (idx === 0) {
                  return part.split('/').map(row => {
                    let result = '';
                    for (let char of row) {
                      if (isNaN(Number(char))) {
                        result += char;
                      } else {
                        result += char;
                      }
                    }
                    return result;
                  }).join('/');
                }
                return part;
              })
              .join(' ');
            updateGame({
              ...game,
              board_state: newFEN,
            });
            Logger.stateChange('board_state', 'piece sacrificed', undefined, selectedSquare);
            setTimeout(() => setAnimatingSquares([]), 600);
          } else {
            Logger.warning('sacrifice card used but no square selected');
          }
          break;

        default:
          Logger.warning(`unknown card type: ${cardType}`);
          updateGame({
            ...game,
            active_effects: [
              ...game.active_effects,
              {
                type: cardType as CardType,
                piece_square: selectedSquare || '',
                turns_remaining: 3,
                metadata: {
                  playedBy: 'white',
                  appliedAt: new Date().toISOString(),
                },
              },
            ],
          });
      }
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
    // For computer games, offer to start a new one
    if (gameId.includes('computer')) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="text-center space-y-4">
            <p className="text-xl text-slate-900 dark:text-white">Game session ended</p>
            <div className="flex gap-4 justify-center">
              <Link href="/game/computer?difficulty=easy" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                New Computer Game
              </Link>
              <Link href="/" className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

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
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto flex-wrap">
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Game Mode</p>
              <p className="text-sm sm:font-semibold text-white capitalize">{game.mode}</p>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-800 hidden sm:block"></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Time Elapsed</p>
              <p className="text-sm sm:font-semibold text-white">{Math.floor(durationSeconds / 60)}m {durationSeconds % 60}s</p>
            </div>
            <div className="w-px h-6 sm:h-8 bg-slate-800 hidden sm:block"></div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Moves</p>
              <p className="text-sm sm:font-semibold text-white">{statistics.moveCount}</p>
            </div>
          </div>
          <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold ${
            isPlayerTurn
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-slate-700/50 text-slate-400 border border-slate-600'
          }`}>
            {isPlayerTurn ? '● Your Turn' : '○ Opponent Turn'}
          </div>
        </div>

        {/* Game Container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {/* Chess Board - Takes 3 columns */}
          <div className="lg:col-span-3 overflow-x-auto">
            <ChessBoard
              fen={game.board_state}
              selectedSquare={selectedSquare}
              onSquareClick={handleSquareClick}
              legalMoves={legalMoves}
              currentTurn={game.current_turn as 'white' | 'black'}
              moves={statistics.moves || []}
              capturedPieces={statistics.capturedPieces || { white: [], black: [] }}
              activeAnimation={activeAnimation}
              animatingSquares={animatingSquares}
              theme={boardTheme}
            />
          </div>

          {/* Right Sidebar - Power Cards & Player Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Theme Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
              <ThemeSelector currentTheme={boardTheme} onThemeChange={setBoardTheme} />
            </div>

            {/* Player Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
                {playerColor === 'white' ? '♔ White (You)' : '♚ Black (You)'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-400">Cards Available</span>
                  <span className="font-semibold text-white">{playerCards.filter(c => c.status === 'available').length}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Power Cards</h3>
              {cardMessage && (
                <div className="mb-3 p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs sm:text-sm text-center font-medium">
                  ✓ {cardMessage}
                </div>
              )}
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {playerCards.length > 0 ? (
                  playerCards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card.id, card.card_type)}
                      disabled={card.status === 'used' || gameOver || !isPlayerTurn || isLoading}
                      className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        activeAnimation === card.card_type ? 'animate-card-activate' : ''
                      } ${
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
                  <p className="text-slate-500 text-xs sm:text-sm text-center py-4">No cards</p>
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
