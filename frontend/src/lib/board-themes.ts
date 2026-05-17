// Chess board theme configurations
export type BoardTheme = 'classic' | 'ocean' | 'forest' | 'neon' | 'gold' | 'marble' | 'twilight';

export interface PieceStyle {
  symbols: Record<string, string>;  // piece symbols (K, Q, R, etc.)
  whitePieceColor: string;          // Tailwind class for white pieces
  blackPieceColor: string;          // Tailwind class for black pieces
  whitePieceGlow?: string;          // optional glow effect for white
  blackPieceGlow?: string;          // optional glow effect for black
}

export interface ThemeConfig {
  name: string;
  description: string;
  light: {
    bg: string;      // background class
    text: string;    // text color class
  };
  dark: {
    bg: string;
    text: string;
  };
  selected: string;  // selection ring color
  legal: string;     // legal move ring color
  boardBg: string;   // board container background
  boardBorder: string; // board border color
  labelColor: string;  // coordinate label color
  accentLight: string;  // accent for light squares
  accentDark: string;   // accent for dark squares
  hoverEffect: string; // hover brightness effect
  pieces: PieceStyle;  // custom piece styling
}

export const BOARD_THEMES: Record<BoardTheme, ThemeConfig> = {
  // Classic wooden chess board
  classic: {
    name: 'Classic',
    description: 'Traditional wooden chess board',
    light: {
      bg: 'bg-amber-100',
      text: 'text-amber-950',
    },
    dark: {
      bg: 'bg-amber-700',
      text: 'text-amber-50',
    },
    selected: 'ring-yellow-400',
    legal: 'ring-green-400',
    boardBg: 'bg-amber-900',
    boardBorder: 'border-amber-800',
    labelColor: 'text-amber-300',
    accentLight: 'hover:bg-amber-200',
    accentDark: 'hover:bg-amber-600',
    hoverEffect: 'hover:brightness-110',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-amber-50 drop-shadow-lg',
      blackPieceColor: 'text-amber-950 drop-shadow-lg',
    },
  },

  // Ocean - Cool blues and teals
  ocean: {
    name: 'Ocean',
    description: 'Deep ocean blue theme',
    light: {
      bg: 'bg-cyan-100',
      text: 'text-cyan-950',
    },
    dark: {
      bg: 'bg-blue-600',
      text: 'text-cyan-50',
    },
    selected: 'ring-yellow-300',
    legal: 'ring-green-300',
    boardBg: 'bg-gradient-to-br from-blue-900 to-cyan-900',
    boardBorder: 'border-blue-800',
    labelColor: 'text-cyan-300',
    accentLight: 'hover:bg-cyan-200',
    accentDark: 'hover:bg-blue-500',
    hoverEffect: 'hover:brightness-120',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-white drop-shadow-lg shadow-cyan-300/50',
      blackPieceColor: 'text-blue-900 drop-shadow-lg',
    },
  },

  // Forest - Green nature theme
  forest: {
    name: 'Forest',
    description: 'Lush green forest aesthetic',
    light: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-950',
    },
    dark: {
      bg: 'bg-emerald-700',
      text: 'text-emerald-50',
    },
    selected: 'ring-yellow-400',
    legal: 'ring-lime-300',
    boardBg: 'bg-gradient-to-br from-green-900 to-emerald-900',
    boardBorder: 'border-green-800',
    labelColor: 'text-green-300',
    accentLight: 'hover:bg-emerald-200',
    accentDark: 'hover:bg-emerald-600',
    hoverEffect: 'hover:brightness-115',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-lime-200 drop-shadow-lg',
      blackPieceColor: 'text-green-950 drop-shadow-lg',
    },
  },

  // Neon - Cyberpunk neon colors
  neon: {
    name: 'Neon',
    description: 'Cyberpunk neon glow',
    light: {
      bg: 'bg-purple-300',
      text: 'text-purple-950',
    },
    dark: {
      bg: 'bg-purple-900',
      text: 'text-pink-200',
    },
    selected: 'ring-cyan-400 ring-4 shadow-lg shadow-cyan-500/50',
    legal: 'ring-lime-400 ring-2 shadow-lg shadow-lime-500/30',
    boardBg: 'bg-gradient-to-br from-purple-950 via-black to-purple-950',
    boardBorder: 'border-pink-500 shadow-lg shadow-pink-500/30',
    labelColor: 'text-cyan-400',
    accentLight: 'hover:bg-purple-400 hover:shadow-lg hover:shadow-cyan-500/40',
    accentDark: 'hover:bg-purple-800 hover:shadow-lg hover:shadow-pink-500/40',
    hoverEffect: 'hover:brightness-150',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-cyan-300 drop-shadow-lg',
      blackPieceColor: 'text-pink-400 drop-shadow-lg',
      whitePieceGlow: 'shadow-lg shadow-cyan-400/50',
      blackPieceGlow: 'shadow-lg shadow-pink-400/50',
    },
  },

  // Gold - Luxury gold and black
  gold: {
    name: 'Gold',
    description: 'Luxury gold premium theme',
    light: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-900',
    },
    dark: {
      bg: 'bg-slate-900',
      text: 'text-yellow-100',
    },
    selected: 'ring-yellow-300 ring-4',
    legal: 'ring-emerald-400 ring-2',
    boardBg: 'bg-gradient-to-br from-slate-950 to-slate-900',
    boardBorder: 'border-yellow-500 border-4',
    labelColor: 'text-yellow-500',
    accentLight: 'hover:bg-yellow-200',
    accentDark: 'hover:bg-slate-800',
    hoverEffect: 'hover:brightness-125',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-yellow-300 drop-shadow-lg',
      blackPieceColor: 'text-slate-900 drop-shadow-lg',
    },
  },

  // Marble - Stone marble aesthetic
  marble: {
    name: 'Marble',
    description: 'Elegant marble stone board',
    light: {
      bg: 'bg-gray-100',
      text: 'text-gray-900',
    },
    dark: {
      bg: 'bg-gray-700',
      text: 'text-gray-100',
    },
    selected: 'ring-blue-400 ring-4',
    legal: 'ring-green-400 ring-2',
    boardBg: 'bg-gradient-to-br from-gray-800 to-gray-900',
    boardBorder: 'border-gray-600 border-4',
    labelColor: 'text-gray-400',
    accentLight: 'hover:bg-gray-200',
    accentDark: 'hover:bg-gray-600',
    hoverEffect: 'hover:brightness-110',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-gray-50 drop-shadow-lg',
      blackPieceColor: 'text-gray-900 drop-shadow-lg',
    },
  },

  // Twilight - Purple and pink sunset
  twilight: {
    name: 'Twilight',
    description: 'Sunset twilight gradient',
    light: {
      bg: 'bg-pink-200',
      text: 'text-purple-950',
    },
    dark: {
      bg: 'bg-purple-700',
      text: 'text-pink-100',
    },
    selected: 'ring-yellow-300 ring-4',
    legal: 'ring-cyan-300 ring-2',
    boardBg: 'bg-gradient-to-br from-purple-800 via-pink-700 to-purple-900',
    boardBorder: 'border-pink-500 border-2',
    labelColor: 'text-pink-300',
    accentLight: 'hover:bg-pink-300',
    accentDark: 'hover:bg-purple-600',
    hoverEffect: 'hover:brightness-120',
    pieces: {
      symbols: {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
      },
      whitePieceColor: 'text-yellow-100 drop-shadow-lg',
      blackPieceColor: 'text-purple-900 drop-shadow-lg',
    },
  },
};

// Default theme
export const DEFAULT_THEME: BoardTheme = 'classic';

// Get theme by name
export function getTheme(themeName: BoardTheme): ThemeConfig {
  return BOARD_THEMES[themeName] || BOARD_THEMES[DEFAULT_THEME];
}

// Get all available themes
export function getAllThemes(): Array<{ id: BoardTheme; name: string; description: string }> {
  return Object.entries(BOARD_THEMES).map(([id, config]) => ({
    id: id as BoardTheme,
    name: config.name,
    description: config.description,
  }));
}
