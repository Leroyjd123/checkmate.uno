'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import { Game, PowerCard, GameContextType, CardType, GameStatistics, MoveResponse, CardUseResponse } from '@/types/game';
import { gamesAPI } from '@/lib/api';

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { game: Game; cards: PowerCard[] } }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'SET_SELECTED_PIECE'; payload: string | null }
  | { type: 'SET_LEGAL_MOVES'; payload: string[] }
  | { type: 'SET_TARGETING_MODE'; payload: CardType | null }
  | { type: 'SET_VALID_TARGETS'; payload: string[] }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'SET_OPPONENT_CARD_COUNT'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_MOVE_COUNT' }
  | { type: 'INCREMENT_CARDS_USED' }
  | { type: 'SYNC_GAME_STATE'; payload: Game }
  | { type: 'REVERT_GAME_STATE'; payload: Game }
  | { type: 'RESET' };

interface GameState {
  game: Game | null;
  playerCards: PowerCard[];
  selectedPiece: string | null;
  legalMoves: string[];
  targetingMode: CardType | null;
  validTargets: string[];
  opponentCardCount: number;
  error: string | null;
  isLoading: boolean;
  statistics: GameStatistics;
}

const initialState: GameState = {
  game: null,
  playerCards: [],
  selectedPiece: null,
  legalMoves: [],
  targetingMode: null,
  validTargets: [],
  opponentCardCount: 3,
  error: null,
  isLoading: false,
  statistics: {
    moveCount: 0,
    cardsUsed: 0,
    startTime: Date.now(),
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        game: action.payload.game,
        playerCards: action.payload.cards,
        selectedPiece: null,
        legalMoves: [],
        targetingMode: null,
        validTargets: [],
        error: null,
      };

    case 'UPDATE_GAME':
      return {
        ...state,
        game: action.payload,
        selectedPiece: null,
        legalMoves: [],
        targetingMode: null,
        validTargets: [],
      };

    case 'SET_SELECTED_PIECE':
      return {
        ...state,
        selectedPiece: action.payload,
        targetingMode: null, // Exit targeting mode if selecting a piece
      };

    case 'SET_LEGAL_MOVES':
      return {
        ...state,
        legalMoves: action.payload,
      };

    case 'SET_TARGETING_MODE':
      return {
        ...state,
        targetingMode: action.payload,
        selectedPiece: null, // Clear selected piece when entering targeting mode
        legalMoves: [],
      };

    case 'SET_VALID_TARGETS':
      return {
        ...state,
        validTargets: action.payload,
      };

    case 'REMOVE_CARD':
      return {
        ...state,
        playerCards: state.playerCards.filter(card => card.id !== action.payload),
      };

    case 'SET_OPPONENT_CARD_COUNT':
      return {
        ...state,
        opponentCardCount: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'INCREMENT_MOVE_COUNT':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          moveCount: state.statistics.moveCount + 1,
        },
      };

    case 'INCREMENT_CARDS_USED':
      return {
        ...state,
        statistics: {
          ...state.statistics,
          cardsUsed: state.statistics.cardsUsed + 1,
        },
      };

    case 'SYNC_GAME_STATE':
      return {
        ...state,
        game: action.payload,
        selectedPiece: null,
        legalMoves: [],
        targetingMode: null,
        validTargets: [],
      };

    case 'REVERT_GAME_STATE':
      return {
        ...state,
        game: action.payload,
      };

    case 'RESET':
      return {
        ...initialState,
        statistics: {
          moveCount: 0,
          cardsUsed: 0,
          startTime: Date.now(),
        },
      };

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const initializeGame = useCallback((game: Game, cards: PowerCard[]) => {
    dispatch({ type: 'INITIALIZE_GAME', payload: { game, cards } });
  }, []);

  const updateGame = useCallback((game: Game) => {
    dispatch({ type: 'UPDATE_GAME', payload: game });
  }, []);

  const setSelectedPiece = useCallback((square: string | null) => {
    dispatch({ type: 'SET_SELECTED_PIECE', payload: square });
  }, []);

  const setLegalMoves = useCallback((moves: string[]) => {
    dispatch({ type: 'SET_LEGAL_MOVES', payload: moves });
  }, []);

  const setTargetingMode = useCallback((card: CardType | null) => {
    dispatch({ type: 'SET_TARGETING_MODE', payload: card });
  }, []);

  const setValidTargets = useCallback((targets: string[]) => {
    dispatch({ type: 'SET_VALID_TARGETS', payload: targets });
  }, []);

  const removeCard = useCallback((cardId: string) => {
    dispatch({ type: 'REMOVE_CARD', payload: cardId });
  }, []);

  const setOpponentCardCount = useCallback((count: number) => {
    dispatch({ type: 'SET_OPPONENT_CARD_COUNT', payload: count });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const incrementMoveCount = useCallback(() => {
    dispatch({ type: 'INCREMENT_MOVE_COUNT' });
  }, []);

  const incrementCardsUsed = useCallback(() => {
    dispatch({ type: 'INCREMENT_CARDS_USED' });
  }, []);

  // API-integrated async actions
  const executeMoveWithAPI = useCallback(
    async (gameId: string, from: string, to: string): Promise<MoveResponse> => {
      if (!state.game) throw new Error('Game not initialized');

      const previousGame = state.game;
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Execute move optimistically on local state
        const tempGame: Game = {
          ...state.game,
          board_state: `${state.game.board_state}|moved:${from}-${to}`, // Placeholder
        };
        dispatch({ type: 'SYNC_GAME_STATE', payload: tempGame });

        // Call backend API
        const response = await gamesAPI.makeMove(gameId, from, to);

        // Sync with server response
        dispatch({
          type: 'SYNC_GAME_STATE',
          payload: {
            ...state.game,
            board_state: response.board_state,
            current_turn: response.current_turn,
            active_effects: response.active_effects,
          },
        });

        dispatch({ type: 'INCREMENT_MOVE_COUNT' });
        dispatch({ type: 'SET_ERROR', payload: null });

        return response;
      } catch (error) {
        // Revert optimistic update on error
        dispatch({ type: 'REVERT_GAME_STATE', payload: previousGame });
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute move';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.game]
  );

  const useCardWithAPI = useCallback(
    async (gameId: string, cardId: string, targetSquare?: string): Promise<CardUseResponse> => {
      if (!state.game) throw new Error('Game not initialized');

      const cardToUse = state.playerCards.find(c => c.id === cardId);
      if (!cardToUse) throw new Error('Card not found');

      const previousGame = state.game;
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Call backend API
        const response = await gamesAPI.useCard(gameId, cardId, { target_square: targetSquare });

        // Sync with server response
        dispatch({
          type: 'SYNC_GAME_STATE',
          payload: {
            ...state.game,
            board_state: response.board_state,
            active_effects: response.active_effects,
          },
        });

        // Remove card from hand
        dispatch({ type: 'REMOVE_CARD', payload: cardId });
        dispatch({ type: 'INCREMENT_CARDS_USED' });
        dispatch({ type: 'SET_TARGETING_MODE', payload: null });
        dispatch({ type: 'SET_ERROR', payload: null });

        return response;
      } catch (error) {
        // Revert on error
        dispatch({ type: 'REVERT_GAME_STATE', payload: previousGame });
        const errorMessage = error instanceof Error ? error.message : 'Failed to use card';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.game, state.playerCards]
  );

  const value: GameContextType = useMemo(() => ({
    game: state.game,
    currentPlayerColor: state.game?.current_turn || 'white',
    playerCards: state.playerCards,
    opponentCardCount: state.opponentCardCount,
    selectedPiece: state.selectedPiece,
    legalMoves: state.legalMoves,
    targetingMode: state.targetingMode,
    validTargets: state.validTargets,
    isLoading: state.isLoading,
    error: state.error,
    statistics: state.statistics,
    initializeGame,
    updateGame,
    setSelectedPiece,
    setLegalMoves,
    setTargetingMode,
    setValidTargets,
    removeCard,
    setOpponentCardCount,
    setError,
    setLoading,
    reset,
    incrementMoveCount,
    incrementCardsUsed,
    executeMoveWithAPI,
    useCardWithAPI,
  }), [state, initializeGame, updateGame, setSelectedPiece, setLegalMoves, setTargetingMode, setValidTargets, removeCard, setOpponentCardCount, setError, setLoading, reset, incrementMoveCount, incrementCardsUsed, executeMoveWithAPI, useCardWithAPI]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}
