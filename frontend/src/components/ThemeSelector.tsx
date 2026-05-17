'use client';

import { BoardTheme, getAllThemes } from '@/lib/board-themes';

interface ThemeSelectorProps {
  currentTheme: BoardTheme;
  onThemeChange: (theme: BoardTheme) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const themes = getAllThemes();

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-white">Board Theme</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${currentTheme === theme.id
                ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }
            `}
            title={theme.description}
          >
            {theme.name}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        {themes.find(t => t.id === currentTheme)?.description}
      </p>
    </div>
  );
}
