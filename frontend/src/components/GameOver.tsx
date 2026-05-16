'use client';

import Link from 'next/link';

interface GameOverProps {
  winner: 'white' | 'black';
  playerColor: 'white' | 'black';
  moveCount: number;
  cardsUsed: number;
  duration: number;
  onReplay?: () => void;
}

export function GameOver({
  winner,
  playerColor,
  moveCount,
  cardsUsed,
  duration,
  onReplay,
}: GameOverProps) {
  const isPlayerWinner = winner === playerColor;
  const winnerText = isPlayerWinner ? 'You Won!' : 'You Lost';
  const bgColor = isPlayerWinner ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';

  const durationMin = Math.floor(duration / 60);
  const durationSec = duration % 60;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8">
        {/* Header */}
        <div className={`bg-gradient-to-r ${bgColor} rounded-xl p-6 mb-6 text-white text-center`}>
          <h2 className="text-4xl font-bold mb-2">
            {isPlayerWinner ? '🎉' : '😔'}
          </h2>
          <h1 className="text-3xl font-bold">{winnerText}</h1>
          <p className="text-sm opacity-90 mt-2">
            {winner === 'white' ? 'White' : 'Black'} is Checkmate
          </p>
        </div>

        {/* Stats */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-slate-600 dark:text-slate-400">Total Moves</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {moveCount}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-slate-600 dark:text-slate-400">Power Cards Used</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {cardsUsed}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <span className="text-slate-600 dark:text-slate-400">Duration</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {durationMin}m {durationSec}s
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {onReplay && (
            <button
              onClick={onReplay}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
            >
              Play Again
            </button>
          )}
          <Link
            href="/"
            className="w-full px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors text-center block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
