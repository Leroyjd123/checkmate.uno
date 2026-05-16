'use client';

import { useState } from 'react';
import { Button, Card, Input, PowerCard, ChessBoard } from '@/components';
import { PowerCard as PowerCardType, CardType } from '@/types/game';

const createCard = (cardType: CardType): PowerCardType => ({
  id: '1',
  game_id: 'demo',
  player_id: 'demo-player',
  card_type: cardType,
  status: 'available',
});

export default function ComponentsShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Checkmate.Uno - Component Library</h1>
            <Button
              variant="secondary"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </Button>
          </div>

          {/* Buttons */}
          <Card title="Buttons" className="mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Variants</h3>
                <div className="flex gap-4 flex-wrap">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sizes</h3>
                <div className="flex gap-4 flex-wrap items-center">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">States</h3>
                <div className="flex gap-4 flex-wrap">
                  <Button>Normal</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Input Fields */}
          <Card title="Input Fields" className="mb-8">
            <div className="space-y-4 max-w-md">
              <Input label="Email Address" type="email" placeholder="you@example.com" />
              <Input label="Password" type="password" placeholder="Enter password" />
              <Input label="Room Code" placeholder="ABC123" maxLength={6} />
              <Input
                label="With Error"
                error="This field is required"
                placeholder="Error state"
              />
              <Input label="Disabled" disabled placeholder="Disabled field" />
            </div>
          </Card>

          {/* Power Cards */}
          <Card title="Power Cards" className="mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <PowerCard card={createCard('skip_turn')} />
              <PowerCard card={createCard('reverse_move')} />
              <PowerCard card={createCard('extra_move')} />
              <PowerCard card={createCard('teleport')} />
              <PowerCard card={createCard('shield')} />
              <PowerCard card={createCard('sacrifice')} />
              <PowerCard card={createCard('wild_swap')} />
              <PowerCard card={createCard('freeze')} />
            </div>
          </Card>

          {/* Chess Board */}
          <Card title="Chess Board" className="mb-8">
            <div className="flex justify-center">
              <ChessBoard
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                selectedSquare={selectedSquare}
                onSquareClick={setSelectedSquare}
                legalMoves={
                  selectedSquare === 'e2' ? ['e3', 'e4'] : []
                }
              />
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {selectedSquare ? `Selected: ${selectedSquare}` : 'Click a square to see legal moves'}
            </p>
          </Card>

          {/* Card Variants */}
          <Card title="Card Component" className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>Simple card without title</Card>
              <Card title="Card with Title">Content inside a titled card</Card>
              <Card title="Player Info" className="md:col-span-2">
                <div className="space-y-2">
                  <p><strong>Username:</strong> PlayerOne</p>
                  <p><strong>Status:</strong> In Game</p>
                  <p><strong>Rating:</strong> 1500 ELO</p>
                </div>
              </Card>
            </div>
          </Card>

          {/* Design Notes */}
          <Card title="Design System Notes" className="mb-8 bg-blue-50 dark:bg-blue-900/20">
            <ul className="space-y-2 text-sm">
              <li>✅ <strong>Colors:</strong> Consistent with brand (Blues, Greens, Reds)</li>
              <li>✅ <strong>Dark Mode:</strong> All components support light/dark themes</li>
              <li>✅ <strong>Spacing:</strong> Built on Tailwind grid (4px units)</li>
              <li>✅ <strong>Typography:</strong> System fonts with clear hierarchy</li>
              <li>✅ <strong>Accessibility:</strong> Semantic HTML, proper contrast ratios</li>
              <li>✅ <strong>Responsive:</strong> Mobile-first, tested on all breakpoints</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
