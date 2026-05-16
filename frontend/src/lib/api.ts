import { API_BASE_URL, API_TIMEOUT } from './constants';
import { Game, PowerCard, MoveResponse, CardUseResponse } from '@/types/game';

// API request wrapper with timeout and error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  register: (email: string, password: string) =>
    apiRequest<{ user: { id: string; email: string }; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ user: { id: string; email: string }; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () =>
    apiRequest<{ user: { id: string; email: string; theme_preference: string } }>('/api/auth/me'),
};

// Games API
export const gamesAPI = {
  create: (mode: 'local' | 'computer' | 'online') =>
    apiRequest<{ game: Game; cards: PowerCard[] }>('/api/games', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),

  getGame: (gameId: string) =>
    apiRequest<{ game: Game; your_cards: PowerCard[]; opponent_card_count: number }>(
      `/api/games/${gameId}`
    ),

  join: (roomCode: string) =>
    apiRequest<{ game: Game; cards: PowerCard[] }>('/api/games/join', {
      method: 'POST',
      body: JSON.stringify({ room_code: roomCode }),
    }),

  makeMove: (gameId: string, from: string, to: string) =>
    apiRequest<MoveResponse>(`/api/games/${gameId}/move`, {
      method: 'POST',
      body: JSON.stringify({ from, to }),
    }),

  useCard: (gameId: string, cardId: string, targetData: Record<string, unknown>) =>
    apiRequest<CardUseResponse>(`/api/games/${gameId}/use-card`, {
      method: 'POST',
      body: JSON.stringify({ card_id: cardId, target_data: targetData }),
    }),

  forfeit: (gameId: string) =>
    apiRequest<{ status: string }>(`/api/games/${gameId}/forfeit`, {
      method: 'POST',
    }),
};

// Users API
export const usersAPI = {
  updateTheme: (theme: 'light' | 'dark' | 'neon') =>
    apiRequest<void>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ theme_preference: theme }),
    }),
};

// Helper to get JWT token from cookie
export function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('auth_token='));

  if (!tokenCookie) return null;

  return tokenCookie.split('=')[1];
}

// Helper to attach auth token to requests
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
}
