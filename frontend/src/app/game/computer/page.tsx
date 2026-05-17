'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Game, PowerCard } from '@/types/game';

function generateGameId(): string {
  return `computer_${Math.random().toString(36).substr(2, 9)}`;
}

export default function ComputerGame() {
  const router = useRouter();
  const { initializeGame } = useGame();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeComputerGame = () => {
      const gameId = generateGameId();

      // Create a computer game object
      const computerGame: Game = {
        id: gameId,
        mode: 'computer',
        status: 'in_progress',
        board_state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        current_turn: 'white',
        active_effects: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock power cards for player
      const mockCards: PowerCard[] = [
        { id: '1', game_id: gameId, player_id: 'player1', card_type: 'shield', status: 'available' },
        { id: '2', game_id: gameId, player_id: 'player1', card_type: 'freeze', status: 'available' },
        { id: '3', game_id: gameId, player_id: 'player1', card_type: 'extra_move', status: 'available' },
      ];

      initializeGame(computerGame, mockCards);
      setIsInitializing(false);

      // Redirect to the actual game page
      router.push(`/game/${gameId}`);
    };

    initializeComputerGame();
  }, [router, initializeGame]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Starting computer game...</p>
        </div>
      </div>
    );
  }

  return null;
}
