'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGame } from '@/contexts/GameContext';
import { gamesAPI } from '@/lib/api';

export default function Lobby() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { setError, setLoading } = useGame();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <p className="text-xl text-slate-900 dark:text-white mb-4">
            You need to be logged in to play online
          </p>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const createRoom = async () => {
    try {
      setLoading(true);
      const response = await gamesAPI.create('online');
      router.push(`/game/${response.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setIsJoining(true);
      const response = await gamesAPI.join(roomCode.toUpperCase());
      router.push(`/game/${response.game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-white">
            ♔ Checkmate.Uno
          </Link>
          <Link
            href="/"
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Online Multiplayer
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Play with friends around the world
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
          {/* Create Room */}
          <button
            onClick={createRoom}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all p-8 text-center"
          >
            <div className="text-5xl mb-4">➕</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
              Create Room
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Start a new game and share the code with a friend
            </p>
          </button>

          {/* Join Room */}
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all p-8 text-center"
          >
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
              Join Room
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Enter a room code to join a friend&apos;s game
            </p>
          </button>
        </div>

        {/* Join Room Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                Join Room
              </h3>

              <input
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white mb-4 text-center text-2xl tracking-widest font-mono"
                onKeyPress={e => e.key === 'Enter' && joinRoom()}
              />

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setRoomCode('');
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={joinRoom}
                  disabled={isJoining}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {isJoining ? 'Joining...' : 'Join'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
