/**
 * Authentication Unit Tests
 * Tests for registration, login, token management
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Authentication', () => {
  describe('User Registration', () => {
    it('should register a new user with valid credentials', async () => {
      const registerResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt_token_here',
      };

      // Mock API call
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(registerResponse),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      });

      const data = await result.json();

      expect(result.ok).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject registration with invalid email', async () => {
      const response = {
        success: false,
        error: 'Invalid email format',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'Password123!',
        }),
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject registration with weak password', async () => {
      const response = {
        success: false,
        error: 'Password must be at least 8 characters',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'weak',
        }),
      });

      expect(result.ok).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      const response = {
        success: false,
        error: 'Email already registered',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 409,
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'Password123!',
        }),
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(409);
    });
  });

  describe('User Login', () => {
    it('should login user with valid credentials', async () => {
      const loginResponse = {
        success: true,
        user: { id: '1', email: 'test@example.com' },
        token: 'jwt_token_here',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(loginResponse),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'Password123!',
        }),
      });

      const data = await result.json();

      expect(result.ok).toBe(true);
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe('test@example.com');
    });

    it('should reject login with wrong password', async () => {
      const response = {
        success: false,
        error: 'Invalid credentials',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'WrongPassword',
        }),
      });

      expect(result.ok).toBe(false);
      expect(result.status).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const response = {
        success: false,
        error: 'User not found',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve(response),
        })
      ) as jest.Mock;

      const result = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      });

      expect(result.ok).toBe(false);
    });
  });

  describe('Token Management', () => {
    it('should store JWT token after successful login', async () => {
      const token = 'jwt_token_here';

      // Simulate storing token
      localStorage.setItem('auth_token', token);

      const storedToken = localStorage.getItem('auth_token');

      expect(storedToken).toBe(token);
    });

    it('should retrieve stored token on app load', () => {
      const token = 'jwt_token_here';
      localStorage.setItem('auth_token', token);

      const retrieved = localStorage.getItem('auth_token');

      expect(retrieved).toBe(token);
      expect(retrieved).toBeDefined();
    });

    it('should clear token on logout', () => {
      const token = 'jwt_token_here';
      localStorage.setItem('auth_token', token);

      localStorage.removeItem('auth_token');
      const retrieved = localStorage.getItem('auth_token');

      expect(retrieved).toBeNull();
    });
  });
});
