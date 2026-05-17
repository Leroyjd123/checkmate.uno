'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Game, PowerCard } from '@/types/game';

function generateGameId(): string {
  return `computer_${Math.random().toString(36).substr(2, 9)}`;
}

function ComputerGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeGame } = useGame();
  const [isInitializing, setIsInitializing] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);

  // Auto-start if difficulty parameter provided
  useEffect(() => {
    const difficultyParam = searchParams?.get('difficulty');
    const colorParam = searchParams?.get('color') as 'white' | 'black' | null;
    if (difficultyParam === 'easy' || difficultyParam === 'medium' || difficultyParam === 'hard') {
      startGame(difficultyParam, colorParam);
    }
  }, [searchParams, initializeGame, router]);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard', playerColor: 'white' | 'black' | null = 'white') => {
    setIsInitializing(true);
    setDifficulty(selectedDifficulty);
    const gameId = generateGameId();

    // Determine whose turn it is - always start with white
    const computerGame: Game = {
      id: gameId,
      mode: 'computer',
      status: 'in_progress',
      board_state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      current_turn: 'white',
      active_effects: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      difficulty: selectedDifficulty,
      player_color: playerColor || 'white', // Track which color the player controls
    };

    // All 8 power cards for player
    const mockCards: PowerCard[] = [
      { id: '1', game_id: gameId, player_id: 'player1', card_type: 'skip_turn', status: 'available' },
      { id: '2', game_id: gameId, player_id: 'player1', card_type: 'reverse_move', status: 'available' },
      { id: '3', game_id: gameId, player_id: 'player1', card_type: 'extra_move', status: 'available' },
      { id: '4', game_id: gameId, player_id: 'player1', card_type: 'teleport', status: 'available' },
      { id: '5', game_id: gameId, player_id: 'player1', card_type: 'shield', status: 'available' },
      { id: '6', game_id: gameId, player_id: 'player1', card_type: 'sacrifice', status: 'available' },
      { id: '7', game_id: gameId, player_id: 'player1', card_type: 'wild_swap', status: 'available' },
      { id: '8', game_id: gameId, player_id: 'player1', card_type: 'freeze', status: 'available' },
    ];

    initializeGame(computerGame, mockCards);

    // Redirect to the actual game page (don't set isInitializing to false, let redirect happen)
    router.push(`/game/${gameId}`);
  };

  if (isInitializing || difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Starting computer game...</p>
        </div>
      </div>
    );
  }

  if (!difficulty) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950 p-4">
        <div className="text-center space-y-6 sm:space-y-8 max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Play vs Computer</h1>
          <p className="text-lg sm:text-xl text-slate-300">Select difficulty level:</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => startGame('easy')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors"
            >
              Easy
            </button>
            <button
              onClick={() => startGame('medium')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors"
            >
              Medium
            </button>
            <button
              onClick={() => startGame('hard')}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-base sm:text-lg transition-colors"
            >
              Hard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function ComputerGame() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Loading...</p>
        </div>
      </div>
    }>
      <ComputerGameContent />
    </Suspense>
  );
}
