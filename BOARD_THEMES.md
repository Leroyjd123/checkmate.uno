# Chess Board Themes System

## Overview

Checkmate.Uno includes a flexible, extensible theming system for chess boards. 6 unique themes are included out-of-the-box, with the ability to add custom themes.

**Live Demo:** Navigate to `/themes` to see all themes in action.

---

## Available Themes

### 1. **Classic** ♞
Traditional wooden chess board with warm amber and brown tones. Perfect for players who appreciate timeless elegance.

**Colors:**
- Light squares: `bg-amber-100`
- Dark squares: `bg-amber-700`
- Selected: `ring-yellow-400`
- Legal moves: `ring-green-400`

### 2. **Ocean** 🌊
Deep blue and cyan theme evoking water and calm. Features enhanced brightness on hover for better visibility.

**Colors:**
- Light squares: `bg-cyan-100`
- Dark squares: `bg-blue-600`
- Selected: `ring-yellow-300`
- Legal moves: `ring-green-300`

### 3. **Forest** 🌲
Lush green nature-inspired theme with emerald tones. Creates an organic, peaceful playing environment.

**Colors:**
- Light squares: `bg-emerald-100`
- Dark squares: `bg-emerald-700`
- Selected: `ring-yellow-400`
- Legal moves: `ring-lime-300`

### 4. **Neon** ⚡
Cyberpunk-inspired futuristic design with glowing neon colors. Features shadow effects and enhanced contrast.

**Colors:**
- Light squares: `bg-purple-300`
- Dark squares: `bg-purple-900`
- Selected: `ring-cyan-400 ring-4 shadow-lg shadow-cyan-500/50`
- Legal moves: `ring-lime-400 ring-2 shadow-lg shadow-lime-500/30`
- Board background: `bg-gradient-to-br from-purple-950 via-black to-purple-950`

### 5. **Gold** 👑
Premium luxury theme with gold accents on black. Evokes high-stakes, sophisticated gameplay.

**Colors:**
- Light squares: `bg-yellow-100`
- Dark squares: `bg-slate-900`
- Selected: `ring-yellow-300 ring-4`
- Legal moves: `ring-emerald-400 ring-2`
- Board border: `border-yellow-500 border-4`

### 6. **Marble** 💎
Elegant stone aesthetic with clean gray tones. Professional appearance for refined players.

**Colors:**
- Light squares: `bg-gray-100`
- Dark squares: `bg-gray-700`
- Selected: `ring-blue-400 ring-4`
- Legal moves: `ring-green-400 ring-2`

### 7. **Twilight** 🌅
Warm sunset gradient blending purple and pink. Romantic, artistic theme for casual play.

**Colors:**
- Light squares: `bg-pink-200`
- Dark squares: `bg-purple-700`
- Selected: `ring-yellow-300 ring-4`
- Legal moves: `ring-cyan-300 ring-2`
- Board background: `bg-gradient-to-br from-purple-800 via-pink-700 to-purple-900`

---

## Using Themes

### In ChessBoard Component

```tsx
import { ChessBoard } from '@/components/ChessBoard';

// Use the Ocean theme
<ChessBoard
  fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  theme="ocean"
  onSquareClick={handleClick}
/>

// Default theme is 'classic'
<ChessBoard fen={...} />
```

### Theme Selector Component

```tsx
import { ThemeSelector } from '@/components/ThemeSelector';
import { useState } from 'react';

export function GameBoard() {
  const [theme, setTheme] = useState<BoardTheme>('classic');

  return (
    <>
      <ThemeSelector currentTheme={theme} onThemeChange={setTheme} />
      <ChessBoard theme={theme} {...otherProps} />
    </>
  );
}
```

---

## Theme Configuration Structure

Each theme in `src/lib/board-themes.ts` has this structure:

```typescript
interface ThemeConfig {
  name: string;           // Display name
  description: string;    // Brief description
  light: {
    bg: string;          // Light square Tailwind class
    text: string;        // Light square text color
  };
  dark: {
    bg: string;          // Dark square Tailwind class
    text: string;        // Dark square text color
  };
  selected: string;      // Selection ring CSS class
  legal: string;         // Legal move ring CSS class
  boardBg: string;       // Board container background
  boardBorder: string;   // Board border styling
  labelColor: string;    // Coordinate labels color
  accentLight: string;   // Light square hover (unused in current version)
  accentDark: string;    // Dark square hover (unused in current version)
  hoverEffect: string;   // Hover brightness effect
}
```

---

## Adding Custom Themes

### Step 1: Add Theme to Configuration

Edit `src/lib/board-themes.ts`:

```typescript
export const BOARD_THEMES: Record<BoardTheme, ThemeConfig> = {
  // ... existing themes ...

  // Your custom theme
  custom: {
    name: 'Custom',
    description: 'My custom theme',
    light: {
      bg: 'bg-[your-light-color]',
      text: 'text-[your-light-text]',
    },
    dark: {
      bg: 'bg-[your-dark-color]',
      text: 'text-[your-dark-text]',
    },
    selected: 'ring-[your-selected-color]',
    legal: 'ring-[your-legal-color]',
    boardBg: 'bg-[your-board-bg]',
    boardBorder: 'border-[your-border]',
    labelColor: 'text-[your-label-color]',
    accentLight: 'hover:bg-[your-accent]',
    accentDark: 'hover:bg-[your-accent]',
    hoverEffect: 'hover:brightness-110',
  },
};
```

### Step 2: Update Type Definition

Add your theme to the `BoardTheme` type:

```typescript
export type BoardTheme = 'classic' | 'ocean' | 'forest' | 'neon' | 'gold' | 'marble' | 'twilight' | 'custom';
```

### Step 3: Use Your Theme

```tsx
<ChessBoard theme="custom" {...props} />
```

---

## Color Palette Reference

### Tailwind Colors Used

- **Slate:** `bg-slate-50` through `bg-slate-950`
- **Amber:** `bg-amber-100`, `bg-amber-700`, `bg-amber-900`
- **Blue:** `bg-blue-500`, `bg-blue-600`, `bg-blue-900`
- **Cyan:** `bg-cyan-100`, `bg-cyan-300`
- **Emerald:** `bg-emerald-100`, `bg-emerald-700`
- **Green:** `bg-green-300`, `bg-green-900`
- **Purple:** `bg-purple-300`, `bg-purple-700`, `bg-purple-900`
- **Pink:** `bg-pink-200`, `bg-pink-500`
- **Yellow:** `bg-yellow-100`, `bg-yellow-300`, `bg-yellow-500`
- **Gray:** `bg-gray-100`, `bg-gray-600`, `bg-gray-700`

---

## Best Practices

1. **Contrast:** Ensure light and dark squares have sufficient contrast for piece visibility
2. **Accessibility:** Test themes with different lighting conditions
3. **Performance:** Avoid complex gradients that may impact rendering
4. **Consistency:** Match accent colors (selected, legal) to the theme aesthetic
5. **Mobile:** Test responsiveness, especially with smaller square sizes

---

## Examples

### Creating a Red/White Theme

```typescript
custom_red: {
  name: 'Red & White',
  description: 'Bold red and white chess board',
  light: {
    bg: 'bg-white',
    text: 'text-red-900',
  },
  dark: {
    bg: 'bg-red-600',
    text: 'text-white',
  },
  selected: 'ring-yellow-400',
  legal: 'ring-green-400',
  boardBg: 'bg-red-800',
  boardBorder: 'border-red-900',
  labelColor: 'text-red-200',
  accentLight: 'hover:bg-gray-100',
  accentDark: 'hover:bg-red-500',
  hoverEffect: 'hover:brightness-110',
}
```

### Creating a Gradient Theme

```typescript
custom_gradient: {
  name: 'Gradient',
  description: 'Dynamic gradient theme',
  light: {
    bg: 'bg-gradient-to-br from-blue-100 to-purple-100',
    text: 'text-slate-900',
  },
  dark: {
    bg: 'bg-gradient-to-br from-blue-600 to-purple-600',
    text: 'text-white',
  },
  // ... rest of config
}
```

---

## Live Showcase

Visit `/themes` to see all themes in action with:
- Theme selector buttons
- Live preview of the selected theme
- Gallery view of all themes at once
- Detailed theme descriptions

---

## Files

- **Configuration:** `src/lib/board-themes.ts`
- **Component:** `src/components/ChessBoard.tsx`
- **Selector:** `src/components/ThemeSelector.tsx`
- **Showcase:** `src/app/themes/page.tsx`

---

## Future Enhancements

- [ ] User theme persistence (localStorage)
- [ ] Custom theme builder UI
- [ ] Theme import/export
- [ ] Animated piece movements per theme
- [ ] Theme-specific sounds
- [ ] Dark mode theme variations
