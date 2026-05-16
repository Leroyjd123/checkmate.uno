'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

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
          <Link href="/" className="font-bold text-lg tracking-tight">
            ♔ Checkmate
          </Link>

          <div className="flex items-center gap-6">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm px-4 py-2 bg-green-500 text-slate-950 rounded-xl font-semibold transition-colors hover:bg-green-400"
                >
                  Get started
                </Link>
              </>
            ) : (
              <button className="text-sm text-slate-300 hover:text-white transition-colors">
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 px-6 py-32 flex items-center justify-center subtle-pattern relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="inline-block mb-6 px-4 py-2 bg-slate-800 rounded-full text-xs font-semibold tracking-wide uppercase text-slate-300">
            Chess + Cards
          </div>

          <h1 className="text-6xl sm:text-7xl font-bold mb-6 leading-tight tracking-tight">
            Strategy<br/>meets<br/>Chance
          </h1>

          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Chess reimagined with power cards and real-time multiplayer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/game/local"
              className="px-8 py-3 bg-green-500 text-slate-950 rounded-xl font-semibold transition-colors hover:bg-green-400"
            >
              Play now
            </Link>
            <Link
              href="/how-to-play"
              className="px-8 py-3 border-2 border-slate-400 text-white rounded-xl font-semibold transition-colors hover:bg-slate-800"
            >
              Learn rules
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold">3</div>
              <div className="text-sm text-slate-400">Game modes</div>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div>
              <div className="text-3xl font-bold">8</div>
              <div className="text-sm text-slate-400">Power cards</div>
            </div>
            <div className="w-px bg-slate-700"></div>
            <div>
              <div className="text-3xl font-bold">∞</div>
              <div className="text-sm text-slate-400">Possibilities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="px-6 py-20 border-t border-slate-800 subtle-pattern relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl font-bold mb-16 text-center">Play</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Local */}
            <Link
              href="/game/local"
              className="group"
            >
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:border-green-500">
                <div className="text-5xl mb-6">♟</div>
                <h3 className="text-2xl font-bold mb-4">Local</h3>
                <p className="text-slate-400 mb-6">
                  Play with a friend on the same device
                </p>
                <div className="text-sm font-semibold text-green-400 group-hover:translate-x-1 transition-transform">
                  Play →
                </div>
              </div>
            </Link>

            {/* AI */}
            <Link
              href="/game/computer"
              className="group"
            >
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:border-red-500">
                <div className="text-5xl mb-6">♚</div>
                <h3 className="text-2xl font-bold mb-4">vs Computer</h3>
                <p className="text-slate-400 mb-6">
                  Challenge an intelligent AI
                </p>
                <div className="text-sm font-semibold text-red-400 group-hover:translate-x-1 transition-transform">
                  Play →
                </div>
              </div>
            </Link>

            {/* Online */}
            <Link
              href={isAuthenticated ? '/lobby' : '/auth/login'}
              className="group"
            >
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:border-blue-500">
                <div className="text-5xl mb-6">♛</div>
                <h3 className="text-2xl font-bold mb-4">Online</h3>
                <p className="text-slate-400 mb-6">
                  {isAuthenticated ? 'Play globally' : 'Sign in to play'}
                </p>
                <div className="text-sm font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                  Play →
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 px-6 py-16 subtle-pattern relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col sm:flex-row gap-12 justify-between pb-10 mb-10 border-b border-slate-800">
            <div className="flex gap-8">
              <Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                About
              </Link>
              <Link href="/how-to-play" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                How to play
              </Link>
              <Link href="/contact" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Contact
              </Link>
            </div>

            <div className="flex gap-8">
              <Link href="/privacy" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Terms
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                GitHub
              </a>
            </div>
          </div>

          <p className="text-center text-xs text-slate-600">
            © 2026 Checkmate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
