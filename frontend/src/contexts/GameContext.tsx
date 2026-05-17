'use client';

import React, { createContext, useContext, useReducer, ReactNode, useMemo, useCallback } from 'react';
import { Game, PowerCard, GameContextType, CardType, GameStatistics, MoveResponse, CardUseResponse } from '@/types/game';
import { gamesAPI } from '@/lib/api';
import { Logger } from '@/lib/logger';

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | { type: 'INITIALIZE_GAME'; payload: { game: Game; cards: PowerCard[] } }
  | { type: 'UPDATE_GAME'; payload: Game }
  | { type: 'SET_SELECTED_PIECE'; payload: string | null }
  | { type: 'SET_LEGAL_MOVES'; payload: string[] }
  | { type: 'SET_TARGETING_MODE'; payload: CardType | null }
  | { type: 'SET_VALID_TARGETS'; payload: string[] }
  | { type: 'MARK_CARD_USED'; payload: string }
  | { type: 'SET_OPPONENT_CARD_COUNT'; payload: number }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_MOVE_COUNT' }
  | { type: 'INCREMENT_CARDS_USED' }
  | { type: 'SYNC_GAME_STATE'; payload: Game }
  | { type: 'REVERT_GAME_STATE'; payload: Game }
  | { type: 'ADD_MOVE_TO_HISTORY'; payload: { from: string; to: string } }
  | { type: 'ADD_CAPTURED_PIECE'; payload: { piece: string; color: 'white' | 'black' } }
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
    moves: [],
    capturedPieces: { white: [], black: [] },
  },
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      Logger.contextUpdate('GameContext', {
        action: 'INITIALIZE_GAME',
        gameId: action.payload.game.id,
        cardCount: action.payload.cards.length,
        mode: action.payload.game.mode,
      });
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
      Logger.stateChange('GameContext', 'UPDATE_GAME', state.game?.board_state, action.payload.board_state);
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

    case 'MARK_CARD_USED':
      const markedCard = state.playerCards.find(c => c.id === action.payload);
      Logger.stateChange('playerCards', `card marked as used`, markedCard?.card_type, 'used');
      return {
        ...state,
        playerCards: state.playerCards.map(card =>
          card.id === action.payload ? { ...card, status: 'used' } : card
        ),
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
      Logger.stateChange('statistics.moveCount', 'incremented', state.statistics.moveCount, state.statistics.moveCount + 1);
      return {
        ...state,
        statistics: {
          ...state.statistics,
          moveCount: state.statistics.moveCount + 1,
        },
      };

    case 'INCREMENT_CARDS_USED':
      Logger.stateChange('statistics.cardsUsed', 'incremented', state.statistics.cardsUsed, state.statistics.cardsUsed + 1);
      return {
        ...state,
        statistics: {
          ...state.statistics,
          cardsUsed: state.statistics.cardsUsed + 1,
        },
      };

    case 'ADD_MOVE_TO_HISTORY':
      Logger.stateChange('statistics.moves', `move added`, `${state.statistics.moves.length} moves`, `${state.statistics.moves.length + 1} moves`);
      return {
        ...state,
        statistics: {
          ...state.statistics,
          moves: [...state.statistics.moves, action.payload],
        },
      };

    case 'ADD_CAPTURED_PIECE':
      Logger.stateChange('statistics.capturedPieces', `${action.payload.color} captured ${action.payload.piece}`);
      return {
        ...state,
        statistics: {
          ...state.statistics,
          capturedPieces: {
            ...state.statistics.capturedPieces,
            [action.payload.color]: [
              ...state.statistics.capturedPieces[action.payload.color],
              action.payload.piece,
            ],
          },
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
          moves: [],
          capturedPieces: { white: [], black: [] },
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

  const addMoveToHistory = useCallback((from: string, to: string) => {
    dispatch({ type: 'ADD_MOVE_TO_HISTORY', payload: { from, to } });
  }, []);

  const addCapturedPiece = useCallback((piece: string, color: 'white' | 'black') => {
    dispatch({ type: 'ADD_CAPTURED_PIECE', payload: { piece, color } });
  }, []);

  const markCardAsUsed = useCallback((cardId: string) => {
    dispatch({ type: 'MARK_CARD_USED', payload: cardId });
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

        // Mark card as used
        dispatch({ type: 'MARK_CARD_USED', payload: cardId });
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
    addMoveToHistory,
    addCapturedPiece,
    markCardAsUsed,
    setOpponentCardCount,
    setError,
    setLoading,
    reset,
    incrementMoveCount,
    incrementCardsUsed,
    executeMoveWithAPI,
    useCardWithAPI,
  }), [state, initializeGame, updateGame, setSelectedPiece, setLegalMoves, setTargetingMode, setValidTargets, addMoveToHistory, addCapturedPiece, markCardAsUsed, setOpponentCardCount, setError, setLoading, reset, incrementMoveCount, incrementCardsUsed, executeMoveWithAPI, useCardWithAPI]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);

  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }

  return context;
}
