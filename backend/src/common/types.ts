/**
 * Common types and interfaces used across the application
 */

export type GameMode = 'local' | 'computer' | 'online';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'forfeited';
export type TurnColor = 'white' | 'black';
export type CardType =
  | 'skip_turn'
  | 'reverse_move'
  | 'extra_move'
  | 'teleport'
  | 'shield'
  | 'sacrifice'
  | 'wild_swap'
  | 'freeze';

export interface ActiveEffect {
  type: string;
  pieceSquare: string;
  turnsRemaining: number;
  appliedBy: TurnColor;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export interface GameResponse {
  id: string;
  mode: GameMode;
  room_code?: string;
  status: GameStatus;
  board_state: string;
  current_turn: TurnColor;
  active_effects: ActiveEffect[];
  host_id?: string;
  guest_id?: string;
  winner_id?: string;
}

export interface CardResponse {
  id: string;
  type: CardType;
  status: 'available' | 'used';
}

export interface MoveResponse {
  board_state: string;
  current_turn: TurnColor;
  is_check: boolean;
  is_checkmate: boolean;
  active_effects: ActiveEffect[];
}
