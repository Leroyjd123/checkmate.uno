'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Game, PowerCard } from '@/types/game';

function generateLocalGameId(): string {
  return `local_${Math.random().toString(36).substr(2, 9)}`;
}

export default function LocalGame() {
  const router = useRouter();
  const { initializeGame } = useGame();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeLocalGame = () => {
      const gameId = generateLocalGameId();

      // Create a local game object
      const localGame: Game = {
        id: gameId,
        mode: 'local',
        status: 'in_progress',
        board_state: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        current_turn: 'white',
        active_effects: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Mock power cards - would normally come from backend
      const mockCards: PowerCard[] = [
        { id: '1', game_id: gameId, player_id: 'player1', card_type: 'shield', status: 'available' },
        { id: '2', game_id: gameId, player_id: 'player1', card_type: 'freeze', status: 'available' },
        { id: '3', game_id: gameId, player_id: 'player1', card_type: 'extra_move', status: 'available' },
      ];

      initializeGame(localGame, mockCards);
      setIsInitializing(false);

      // Redirect to the actual game page
      router.push(`/game/${gameId}`);
    };

    initializeLocalGame();
  }, [router, initializeGame]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Starting local game...</p>
        </div>
      </div>
    );
  }

  return null;
}
