'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';

export default function ComputerGame() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const { setError } = useGame();
  const [isCreating, setIsCreating] = useState(true);

  useEffect(() => {
    const createComputerGame = async () => {
      try {
        if (isLoading) return;

        // Call API to create computer game
        // TODO: Implement when backend is ready

        setError('Computer games coming soon!');
        router.push('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create game');
        router.push('/');
      } finally {
        setIsCreating(false);
      }
    };

    if (!isLoading) {
      createComputerGame();
    }
  }, [router, isLoading, setError]);

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white">Creating computer game...</p>
        </div>
      </div>
    );
  }

  return null;
}
