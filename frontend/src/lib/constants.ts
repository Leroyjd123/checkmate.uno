import { CardDefinition, CardType, Theme } from '@/types/game';

export const CARD_DEFINITIONS: Record<CardType, CardDefinition> = {
  skip_turn: {
    type: 'skip_turn',
    name: 'Skip Turn',
    description: "Opponent's next turn is skipped",
    color: 'bg-red-500',
  },
  reverse_move: {
    type: 'reverse_move',
    name: 'Reverse Move',
    description: "Undo opponent's last move",
    color: 'bg-blue-500',
  },
  extra_move: {
    type: 'extra_move',
    name: 'Extra Move',
    description: 'Make 2 moves this turn',
    color: 'bg-green-500',
  },
  teleport: {
    type: 'teleport',
    name: 'Teleport',
    description: 'Move any piece to any empty square',
    color: 'bg-purple-500',
  },
  shield: {
    type: 'shield',
    name: 'Shield',
    description: 'Protect your piece for 3 turns',
    color: 'bg-yellow-500',
  },
  sacrifice: {
    type: 'sacrifice',
    name: 'Sacrifice',
    description: "Remove opponent's pawn",
    color: 'bg-orange-500',
  },
  wild_swap: {
    type: 'wild_swap',
    name: 'Wild Swap',
    description: 'Swap positions of any 2 pieces',
    color: 'bg-pink-500',
  },
  freeze: {
    type: 'freeze',
    name: 'Freeze',
    description: "Opponent's piece cannot move for 2 turns",
    color: 'bg-cyan-500',
  },
};

export const THEMES: Record<Theme, { bg: string; board_light: string; board_dark: string; text: string }> = {
  light: {
    bg: 'bg-slate-100',
    board_light: 'bg-amber-100',
    board_dark: 'bg-amber-700',
    text: 'text-slate-900',
  },
  dark: {
    bg: 'bg-slate-900',
    board_light: 'bg-slate-600',
    board_dark: 'bg-slate-800',
    text: 'text-slate-100',
  },
  neon: {
    bg: 'bg-slate-950',
    board_light: 'bg-lime-400',
    board_dark: 'bg-pink-600',
    text: 'text-lime-400',
  },
};

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || 'ws://localhost:3001';

export const CHESS_SQUARE_SIZE = 60; // pixels
export const BOARD_SIZE = 8;

export const LEGAL_MOVE_INDICATOR = 'legal-move';
export const SELECTED_SQUARE_INDICATOR = 'selected';
export const CHECK_INDICATOR = 'in-check';

export const API_TIMEOUT = 10000; // 10 seconds
export const WS_RECONNECT_ATTEMPTS = 5;
