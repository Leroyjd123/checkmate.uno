'use client';

import Link from 'next/link';

export default function HowToPlay() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <style jsx>{`
        .subtle-pattern {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            ♔ Checkmate
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">
            Back home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-16 subtle-pattern">
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl font-bold mb-8">How to Play</h1>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4">Basic Rules</h2>
              <p>
                Checkmate follows standard chess rules with one addition: power cards. If you know chess, you know most of the game already.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">The Board</h2>
              <p>
                An 8×8 board with standard chess setup. White always moves first. Pieces move according to traditional chess rules: pawns forward, knights in L-shapes, bishops diagonally, rooks horizontally/vertically, queens any direction, and kings one square in any direction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Power Cards</h2>
              <p>
                Each player starts with 3 power cards drawn from a deck of 8 unique cards. You can use one card per turn (after making your move) to gain an advantage.
              </p>
              <ul className="space-y-3 mt-4 ml-4">
                <li><strong className="text-green-400">Skip Turn</strong> - Opponent loses their next move</li>
                <li><strong className="text-red-400">Reverse Move</strong> - Undo opponent's last move</li>
                <li><strong className="text-blue-400">Extra Move</strong> - Take an additional move immediately</li>
                <li><strong className="text-yellow-400">Teleport</strong> - Move any of your pieces to any empty square</li>
                <li><strong className="text-green-400">Shield</strong> - Protect a piece from capture for one turn</li>
                <li><strong className="text-red-400">Sacrifice</strong> - Remove a piece to take an opponent's piece</li>
                <li><strong className="text-blue-400">Wild Swap</strong> - Swap positions of any two pieces</li>
                <li><strong className="text-yellow-400">Freeze</strong> - Prevent a piece from moving for one turn</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Winning</h2>
              <p>
                Win by checkmating your opponent (king is in check and has no legal moves) or by causing them to abandon the game. Power cards add tactical depth but don't change the fundamental goal: checkmate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Game Modes</h2>
              <ul className="space-y-3 ml-4">
                <li><strong className="text-green-400">Local:</strong> Play with a friend on the same device. Take turns at the board.</li>
                <li><strong className="text-red-400">vs Computer:</strong> Challenge our AI opponent. Available at different difficulty levels.</li>
                <li><strong className="text-blue-400">Online:</strong> Play real-time games with friends or random opponents worldwide.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Strategy Tips</h2>
              <ul className="space-y-2 ml-4">
                <li>• Save power cards for critical moments</li>
                <li>• Learn when to use defensive vs offensive cards</li>
                <li>• Adapt to your opponent's card usage</li>
                <li>• Master classical chess first, power cards second</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 bg-slate-950">
        <div className="max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© 2026 Checkmate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
