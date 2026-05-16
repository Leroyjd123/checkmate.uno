import type { Meta } from '@storybook/react';

const meta = {
  title: 'Design System/Colors & Tokens',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

const colors = {
  'Background': [
    { name: 'Slate 950', value: '#0f172a', hex: 'slate-950' },
    { name: 'Slate 900', value: '#0f172a', hex: 'slate-900' },
    { name: 'Slate 800', value: '#1e293b', hex: 'slate-800' },
  ],
  'Primary Accent': [
    { name: 'Green 500', value: '#22c55e', hex: 'green-500' },
    { name: 'Green 400', value: '#4ade80', hex: 'green-400' },
  ],
  'Secondary Accents': [
    { name: 'Blue 500', value: '#3b82f6', hex: 'blue-500' },
    { name: 'Blue 400', value: '#60a5fa', hex: 'blue-400' },
    { name: 'Red 500', value: '#ef4444', hex: 'red-500' },
    { name: 'Red 400', value: '#f87171', hex: 'red-400' },
    { name: 'Yellow 500', value: '#eab308', hex: 'yellow-500' },
    { name: 'Yellow 400', value: '#facc15', hex: 'yellow-400' },
  ],
  'Text': [
    { name: 'White', value: '#ffffff', hex: 'white' },
    { name: 'Slate 300', value: '#cbd5e1', hex: 'slate-300' },
    { name: 'Slate 400', value: '#94a3b8', hex: 'slate-400' },
  ],
};

export const ColorPalette = () => (
  <div className="bg-slate-950 min-h-screen p-8 text-white">
    <h1 className="text-4xl font-bold mb-12">Design System - Colors & Tokens</h1>

    <div className="space-y-12">
      {Object.entries(colors).map(([category, colorList]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-6 text-slate-300">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {colorList.map((color) => (
              <div key={color.hex} className="space-y-2">
                <div
                  className="w-full h-24 rounded-lg border border-slate-700"
                  style={{ backgroundColor: color.value }}
                />
                <div>
                  <p className="font-semibold text-sm">{color.name}</p>
                  <p className="text-xs text-slate-400">{color.hex}</p>
                  <p className="text-xs text-slate-500 font-mono">{color.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-16 pt-16 border-t border-slate-800">
      <h2 className="text-2xl font-bold mb-6">Game Mode Colors</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-green-500">
          <h3 className="text-xl font-bold text-green-400 mb-2">Local</h3>
          <p className="text-slate-300 text-sm">Green for local gameplay</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-red-500">
          <h3 className="text-xl font-bold text-red-400 mb-2">vs Computer</h3>
          <p className="text-slate-300 text-sm">Red for competitive challenge</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border-2 border-blue-500">
          <h3 className="text-xl font-bold text-blue-400 mb-2">Online</h3>
          <p className="text-slate-300 text-sm">Blue for multiplayer</p>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-16 border-t border-slate-800">
      <h2 className="text-2xl font-bold mb-6">Typography Scale</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-400 mb-1">H1</p>
          <h1 className="text-5xl font-bold">Heading 1 - 3rem</h1>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">H2</p>
          <h2 className="text-3xl font-bold">Heading 2 - 1.875rem</h2>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">H3</p>
          <h3 className="text-2xl font-bold">Heading 3 - 1.5rem</h3>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">Body Large</p>
          <p className="text-lg">Body text large - 1.125rem</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">Body</p>
          <p className="text-base">Body text - 1rem</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 mb-1">Body Small</p>
          <p className="text-sm">Body text small - 0.875rem</p>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-16 border-t border-slate-800">
      <h2 className="text-2xl font-bold mb-6">Border Radius</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="w-full h-20 bg-green-500 rounded mb-2" />
          <p className="text-sm text-slate-400">rounded (0.25rem)</p>
        </div>
        <div>
          <div className="w-full h-20 bg-green-500 rounded-lg mb-2" />
          <p className="text-sm text-slate-400">rounded-lg (0.5rem)</p>
        </div>
        <div>
          <div className="w-full h-20 bg-green-500 rounded-xl mb-2" />
          <p className="text-sm text-slate-400">rounded-xl (0.75rem)</p>
        </div>
        <div>
          <div className="w-full h-20 bg-green-500 rounded-2xl mb-2" />
          <p className="text-sm text-slate-400">rounded-2xl (1rem)</p>
        </div>
      </div>
    </div>
  </div>
);
