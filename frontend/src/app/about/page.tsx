'use client';

import Link from 'next/link';

export default function About() {
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
          <h1 className="text-4xl font-bold mb-8">About Checkmate</h1>

          <div className="space-y-6 text-slate-300 leading-relaxed">
            <p>
              Checkmate is a modern take on chess that combines the strategic depth of the world&apos;s greatest game with the unpredictability of power cards.
            </p>

            <p>
              We believe chess should be accessible, entertaining, and endlessly replayable. By introducing power cards—special moves that can reverse situations, protect pieces, or change the tempo—we&apos;ve created a game that rewards both classical strategy and creative thinking.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Features</h2>
            <ul className="space-y-2 ml-4">
              <li>• <strong className="text-green-400">Three game modes:</strong> Local, vs Computer, Online</li>
              <li>• <strong className="text-yellow-400">8 unique power cards:</strong> Each with distinct effects</li>
              <li>• <strong className="text-blue-400">Real-time multiplayer:</strong> Play worldwide instantly</li>
              <li>• <strong className="text-red-400">Endless replayability:</strong> Every game feels unique</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4">Why we built this</h2>
            <p>
              Chess has been unchanged for centuries. While that&apos;s a testament to its perfection, we wondered: what if we added an element of surprise? Power cards introduce new strategic decisions while respecting the core rules of chess.
            </p>

            <p>
              The result is a game that feels familiar to chess players but remains fresh and unpredictable, making every game worth playing.
            </p>
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
