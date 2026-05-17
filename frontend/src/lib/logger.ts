// Console logging system with styled badges and tracking

type LogLevel = 'info' | 'success' | 'warning' | 'error' | 'action' | 'game' | 'api' | 'render' | 'state' | 'card' | 'move';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  stack?: string;
}

const logHistory: LogEntry[] = [];

const styles = {
  info: {
    emoji: 'ℹ️',
    badge: 'background: #3B82F6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#3B82F6',
  },
  success: {
    emoji: '✅',
    badge: 'background: #10B981; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#10B981',
  },
  warning: {
    emoji: '⚠️',
    badge: 'background: #F59E0B; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#F59E0B',
  },
  error: {
    emoji: '❌',
    badge: 'background: #EF4444; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#EF4444',
  },
  action: {
    emoji: '⚡',
    badge: 'background: #8B5CF6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#8B5CF6',
  },
  game: {
    emoji: '♟️',
    badge: 'background: #6B7280; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#6B7280',
  },
  api: {
    emoji: '🔌',
    badge: 'background: #06B6D4; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#06B6D4',
  },
  render: {
    emoji: '🎨',
    badge: 'background: #EC4899; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#EC4899',
  },
  state: {
    emoji: '🔄',
    badge: 'background: #14B8A6; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#14B8A6',
  },
  card: {
    emoji: '🎴',
    badge: 'background: #F97316; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#F97316',
  },
  move: {
    emoji: '🎯',
    badge: 'background: #DC2626; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
    color: '#DC2626',
  },
};

function getTimestamp(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  });
}

function log(level: LogLevel, category: string, message: string, data?: unknown) {
  const timestamp = getTimestamp();
  const style = styles[level];
  const categoryBadge = `%c${category}%c`;
  const levelBadge = `%c${level.toUpperCase()}%c`;

  const entry: LogEntry = {
    timestamp,
    level,
    category,
    message,
    data,
  };

  logHistory.push(entry);

  const timeBadge = `%c[${timestamp}]%c`;

  if (data !== undefined) {
    console.log(
      `${style.emoji} ${timeBadge} ${categoryBadge} ${levelBadge} %c${message}`,
      'color: #9CA3AF; font-weight: bold;',
      'color: inherit;',
      style.badge,
      'color: inherit;',
      `background: ${style.color}80; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
      'color: inherit;',
      `color: ${style.color}; font-weight: 600;`,
      data
    );
  } else {
    console.log(
      `${style.emoji} ${timeBadge} ${categoryBadge} ${levelBadge} %c${message}`,
      'color: #9CA3AF; font-weight: bold;',
      'color: inherit;',
      style.badge,
      'color: inherit;',
      `background: ${style.color}80; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;`,
      'color: inherit;',
      `color: ${style.color}; font-weight: 600;`
    );
  }
}

export const Logger = {
  // Game events
  gameStart: (details?: unknown) => log('game', 'GAME', 'Game started', details),
  gameMove: (from: string, to: string, details?: unknown) =>
    log('move', 'MOVE', `${from} → ${to}`, details),
  gameEnd: (winner: string, details?: unknown) =>
    log('game', 'GAME', `Game ended - Winner: ${winner}`, details),
  gameCheck: (piece: string) => log('game', 'GAME', `Check on ${piece}`),
  gameCheckmate: () => log('game', 'GAME', '♔ CHECKMATE!'),
  gameStalemate: () => log('game', 'GAME', 'Stalemate'),

  // Card events
  cardUsed: (cardType: string, target?: string) =>
    log('card', 'CARD', `${cardType} used${target ? ` on ${target}` : ''}`, { cardType, target }),
  cardEffect: (cardType: string, effect: string) =>
    log('card', 'CARD', `${cardType}: ${effect}`, { cardType, effect }),
  cardError: (cardType: string, error: string) =>
    log('error', 'CARD', `${cardType} - ${error}`, { cardType, error }),

  // State changes
  stateChange: (component: string, change: string, oldValue?: unknown, newValue?: unknown) =>
    log('state', 'STATE', `${component}: ${change}`, { old: oldValue, new: newValue }),
  contextUpdate: (context: string, details?: unknown) =>
    log('state', 'STATE', `Context updated: ${context}`, details),

  // API calls
  apiCall: (method: string, endpoint: string) =>
    log('api', 'API', `${method} ${endpoint}`),
  apiSuccess: (method: string, endpoint: string, data?: unknown) =>
    log('success', 'API', `${method} ${endpoint} - Success`, data),
  apiError: (method: string, endpoint: string, error: unknown) =>
    log('error', 'API', `${method} ${endpoint} - Error`, error),

  // Actions
  action: (action: string, details?: unknown) =>
    log('action', 'ACTION', action, details),
  userInteraction: (element: string, interaction: string, details?: unknown) =>
    log('action', 'INTERACTION', `${element}: ${interaction}`, details),

  // Rendering
  componentRender: (component: string, props?: unknown) =>
    log('render', 'RENDER', `${component} rendered`, props),
  componentUpdate: (component: string, reason: string) =>
    log('render', 'RENDER', `${component} updated - ${reason}`),

  // Information
  info: (message: string, data?: unknown) =>
    log('info', 'INFO', message, data),
  success: (message: string, data?: unknown) =>
    log('success', 'SUCCESS', message, data),
  warning: (message: string, data?: unknown) =>
    log('warning', 'WARNING', message, data),
  error: (message: string, error?: unknown) =>
    log('error', 'ERROR', message, error),

  // Utilities
  group: (title: string) => console.group(`%c${title}`, `color: #6366F1; font-weight: bold; font-size: 14px;`),
  groupEnd: () => console.groupEnd(),
  table: (data: unknown) => console.table(data),
  getHistory: () => logHistory,
  clearHistory: () => logHistory.splice(0, logHistory.length),
  exportHistory: () => JSON.stringify(logHistory, null, 2),
  trace: (message: string) => {
    console.trace(`%c${message}`, 'color: #7C3AED; font-weight: bold;');
  },
};

// Export individual functions for easy importing
export const logGameMove = Logger.gameMove;
export const logCardUsed = Logger.cardUsed;
export const logStateChange = Logger.stateChange;
export const logApiCall = Logger.apiCall;
export const logAction = Logger.action;
export const logError = Logger.error;
export const logSuccess = Logger.success;
export const logInfo = Logger.info;
