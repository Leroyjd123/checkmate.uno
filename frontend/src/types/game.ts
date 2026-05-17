// Game types
export type GameMode = 'local' | 'computer' | 'online';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';
export type PlayerColor = 'white' | 'black';
export type Theme = 'light' | 'dark' | 'neon';

export interface User {
  id: string;
  email: string;
  theme_preference: Theme;
  created_at: string;
}

export interface Game {
  id: string;
  mode: GameMode;
  status: GameStatus;
  room_code?: string;
  host_id?: string;
  guest_id?: string;
  board_state: string; // FEN notation
  current_turn: PlayerColor;
  winner_id?: string;
  active_effects: ActiveEffect[];
  created_at: string;
  updated_at: string;
}

export interface PowerCard {
  id: string;
  game_id: string;
  player_id: string;
  card_type: CardType;
  status: 'available' | 'used';
}

export type CardType =
  | 'skip_turn'
  | 'reverse_move'
  | 'extra_move'
  | 'teleport'
  | 'shield'
  | 'sacrifice'
  | 'wild_swap'
  | 'freeze';

export interface CardDefinition {
  type: CardType;
  name: string;
  description: string;
  color: string;
}

export interface ActiveEffect {
  type: CardType;
  piece_square?: string;
  turns_remaining: number;
  metadata?: Record<string, unknown>;
}

export interface Move {
  from: string;
  to: string;
  piece?: string;
}

export interface GameContextType {
  game: Game | null;
  currentPlayerColor: PlayerColor;
  playerCards: PowerCard[];
  opponentCardCount: number;
  selectedPiece: string | null;
  legalMoves: string[];
  targetingMode: CardType | null;
  validTargets: string[];
  isLoading: boolean;
  error: string | null;
  statistics: GameStatistics;

  // Sync Actions
  initializeGame: (game: Game, cards: PowerCard[]) => void;
  updateGame: (game: Game) => void;
  setSelectedPiece: (square: string | null) => void;
  setLegalMoves: (moves: string[]) => void;
  setTargetingMode: (card: CardType | null) => void;
  setValidTargets: (targets: string[]) => void;
  removeCard: (cardId: string) => void;
  setOpponentCardCount: (count: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  incrementMoveCount: () => void;
  incrementCardsUsed: () => void;
  reset: () => void;

  // Async Actions (API-integrated)
  executeMoveWithAPI: (gameId: string, from: string, to: string) => Promise<MoveResponse>;
  useCardWithAPI: (gameId: string, cardId: string, targetSquare?: string) => Promise<CardUseResponse>;
}

export interface MoveResponse {
  board_state: string;
  current_turn: PlayerColor;
  is_check: boolean;
  is_checkmate: boolean;
  active_effects: ActiveEffect[];
}

export interface CardUseResponse {
  board_state: string;
  active_effects: ActiveEffect[];
  is_checkmate?: boolean;
  winner_id?: string;
}

export interface GameStatistics {
  moveCount: number;
  cardsUsed: number;
  startTime: number;
  endTime?: number;
  moves: Move[];
  capturedPieces: { white: string[]; black: string[] };
}

export interface GameHistory {
  move: Move;
  cardUsed?: CardType;
  timestamp: number;
}
