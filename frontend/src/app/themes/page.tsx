'use client';

import { useState } from 'react';
import { ChessBoard } from '@/components/ChessBoard';
import { BoardTheme, getAllThemes, getTheme } from '@/lib/board-themes';

export default function ThemesShowcase() {
  const [selectedTheme, setSelectedTheme] = useState<BoardTheme>('classic');
  const themes = getAllThemes();

  // Starting position FEN
  const startingFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Chess Board Themes</h1>
          <p className="text-slate-400 text-lg">
            Explore 7 unique board designs. Choose your favorite aesthetic for gameplay.
          </p>
        </div>

        {/* Theme Selection */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Select Theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`
                  px-4 py-3 rounded-lg font-semibold transition-all
                  ${selectedTheme === theme.id
                    ? 'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <div>{theme.name}</div>
                <div className="text-xs mt-1 opacity-75">{theme.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Theme Preview */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Live Preview</h2>
          <div className="flex justify-center">
            <ChessBoard
              fen={startingFEN}
              theme={selectedTheme}
              selectedSquare="e2"
              legalMoves={['e3', 'e4']}
              moves={[]}
              capturedPieces={{ white: [], black: [] }}
              currentTurn="white"
            />
          </div>
        </div>

        {/* Theme Gallery */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">All Themes at a Glance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {themes.map((theme) => {
              const themeConfig = getTheme(theme.id as BoardTheme);
              const samplePieces = ['K', 'Q', 'R', 'B', 'N', 'P'];
              return (
                <div key={theme.id} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                  <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                  <p className="text-slate-400 mb-4">{theme.description}</p>

                  {/* Board Preview */}
                  <div className="flex justify-center py-4 bg-slate-950 rounded-lg overflow-x-auto mb-4">
                    <div className="scale-75 origin-top-left">
                      <ChessBoard
                        fen={startingFEN}
                        theme={theme.id as BoardTheme}
                        selectedSquare="d4"
                        legalMoves={['d3', 'd5']}
                        moves={[]}
                        capturedPieces={{ white: [], black: [] }}
                        currentTurn="white"
                      />
                    </div>
                  </div>

                  {/* Piece Color Preview */}
                  <div className="bg-slate-950 rounded-lg p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-3">Piece Colors</p>
                    <div className="flex justify-between items-end gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2 font-medium">White Pieces</p>
                        <div className="flex gap-1 text-2xl justify-center">
                          {samplePieces.map((piece) => (
                            <span key={piece} className={themeConfig.pieces.whitePieceColor}>
                              {themeConfig.pieces.symbols[piece]}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-500 mb-2 font-medium">Black Pieces</p>
                        <div className="flex gap-1 text-2xl justify-center">
                          {samplePieces.map((piece) => (
                            <span key={piece} className={themeConfig.pieces.blackPieceColor}>
                              {themeConfig.pieces.symbols[piece.toLowerCase()]}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Details */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Theme Descriptions</h2>
          <div className="grid gap-4">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-amber-100 mb-2">♞ Classic</h3>
              <p className="text-slate-300">
                A traditional wooden chess board design. Warm amber tones with rich browns create a timeless, elegant aesthetic perfect for serious play.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-cyan-100 mb-2">🌊 Ocean</h3>
              <p className="text-slate-300">
                Deep blues and teals evoke a sense of water and calm. Perfect for players who love serene, cool-toned environments with enhanced visual clarity.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-emerald-100 mb-2">🌲 Forest</h3>
              <p className="text-slate-300">
                Lush green tones bring nature to your game. This theme features rich emerald and forest colors for players who enjoy organic, nature-inspired aesthetics.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-cyan-300 mb-2">⚡ Neon</h3>
              <p className="text-slate-300">
                A cyberpunk-inspired design with glowing neon purple, pink, and cyan. Features enhanced contrast and shadow effects for a futuristic, modern look.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-yellow-300 mb-2">👑 Gold</h3>
              <p className="text-slate-300">
                Luxury gold accents on a deep black background. This premium theme evokes sophistication and high-stakes gameplay with bold, striking contrasts.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-gray-300 mb-2">💎 Marble</h3>
              <p className="text-slate-300">
                Elegant stone and marble textures create a sophisticated, professional appearance. Clean gray tones with subtle depth for refined gameplay.
              </p>
            </div>
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-pink-300 mb-2">🌅 Twilight</h3>
              <p className="text-slate-300">
                Warm sunset gradient blending purple and pink tones. A romantic, artistic theme perfect for casual play with a beautiful, modern aesthetic.
              </p>
            </div>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3">💡 For Developers</h3>
          <p className="text-slate-300 mb-4">
            Themes are fully customizable and can be extended. Each theme defines:
          </p>
          <ul className="text-slate-300 space-y-2 ml-4">
            <li>• <code className="bg-slate-800 px-2 py-1 rounded text-sm">light.bg</code> - Light square background color</li>
            <li>• <code className="bg-slate-800 px-2 py-1 rounded text-sm">dark.bg</code> - Dark square background color</li>
            <li>• <code className="bg-slate-800 px-2 py-1 rounded text-sm">selected</code> - Selection highlight ring</li>
            <li>• <code className="bg-slate-800 px-2 py-1 rounded text-sm">legal</code> - Legal move indicator</li>
            <li>• <code className="bg-slate-800 px-2 py-1 rounded text-sm">boardBg</code> - Board container background</li>
          </ul>
          <p className="text-slate-400 text-sm mt-4">
            Edit <code className="bg-slate-800 px-2 py-1 rounded">src/lib/board-themes.ts</code> to add custom themes.
          </p>
        </div>
      </div>
    </div>
  );
}
