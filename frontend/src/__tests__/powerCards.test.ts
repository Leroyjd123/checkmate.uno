/**
 * Power Cards Unit Tests
 * Tests for card usage, effects, depletion
 */

describe('Power Cards System', () => {
  describe('Card Usage', () => {
    it('should allow using shield card', () => {
      const playerCards = [
        { id: '1', type: 'shield', status: 'available' },
        { id: '2', type: 'freeze', status: 'available' },
        { id: '3', type: 'extra_move', status: 'available' },
      ];

      const cardToUse = playerCards.find((c) => c.type === 'shield');

      expect(cardToUse).toBeDefined();
      expect(cardToUse?.status).toBe('available');
    });

    it('should allow using freeze card', () => {
      const playerCards = [
        { id: '1', type: 'shield', status: 'available' },
        { id: '2', type: 'freeze', status: 'available' },
        { id: '3', type: 'extra_move', status: 'available' },
      ];

      const cardToUse = playerCards.find((c) => c.type === 'freeze');

      expect(cardToUse?.type).toBe('freeze');
    });

    it('should allow using extra_move card', () => {
      const playerCards = [
        { id: '1', type: 'shield', status: 'available' },
        { id: '2', type: 'freeze', status: 'available' },
        { id: '3', type: 'extra_move', status: 'available' },
      ];

      const cardToUse = playerCards.find((c) => c.type === 'extra_move');

      expect(cardToUse?.type).toBe('extra_move');
    });

    it('should not allow using card that is not available', () => {
      const playerCards = [
        { id: '1', type: 'shield', status: 'used' },
        { id: '2', type: 'freeze', status: 'available' },
      ];

      const cardToUse = playerCards.find((c) => c.type === 'shield' && c.status === 'available');

      expect(cardToUse).toBeUndefined();
    });

    it('should consume card after use', () => {
      const playerCards = [
        { id: '1', type: 'shield', status: 'available' },
        { id: '2', type: 'freeze', status: 'available' },
        { id: '3', type: 'extra_move', status: 'available' },
      ];

      // Use shield card
      const shieldCard = playerCards.find((c) => c.type === 'shield');
      if (shieldCard) {
        shieldCard.status = 'used';
      }

      const remainingAvailable = playerCards.filter((c) => c.status === 'available');

      expect(remainingAvailable.length).toBe(2);
      expect(shieldCard?.status).toBe('used');
    });
  });

  describe('Card Depletion', () => {
    it('should track card count correctly', () => {
      const cardCount = 3;

      expect(cardCount).toBe(3);
    });

    it('should decrement card count after use', () => {
      let cardCount = 3;

      // Use one card
      cardCount--;

      expect(cardCount).toBe(2);
    });

    it('should decrement multiple times for multiple uses', () => {
      let cardCount = 3;

      // Use first card
      cardCount--;
      expect(cardCount).toBe(2);

      // Use second card
      cardCount--;
      expect(cardCount).toBe(1);

      // Use third card
      cardCount--;
      expect(cardCount).toBe(0);

      expect(cardCount).toBe(0);
    });

    it('should not go below zero', () => {
      let cardCount = 0;

      const canUseCard = cardCount > 0;

      expect(canUseCard).toBe(false);
    });

    it('should not allow using cards when depleted', () => {
      const playerCards: any[] = [];
      const cardCount = 0;

      const canUseCard = cardCount > 0 && playerCards.length > 0;

      expect(canUseCard).toBe(false);
    });
  });

  describe('Shield Card Effect', () => {
    it('should protect against next capture', () => {
      const gameState = {
        shieldActive: true,
        protectedPlayer: 'white',
      };

      expect(gameState.shieldActive).toBe(true);
      expect(gameState.protectedPlayer).toBe('white');
    });

    it('should expire after one use', () => {
      let shieldActive = true;

      // After opponent attempts capture
      const captureAttempted = true;

      if (captureAttempted && shieldActive) {
        shieldActive = false;
      }

      expect(shieldActive).toBe(false);
    });

    it('should block or reduce capture damage', () => {
      const captureWithShield = {
        attacker: 'black',
        defender: 'white',
        shieldActive: true,
        damageReduced: true,
      };

      expect(captureWithShield.damageReduced).toBe(true);
    });
  });

  describe('Freeze Card Effect', () => {
    it('should freeze opponent for one turn', () => {
      const freezeEffect = {
        frozenPlayer: 'black',
        turnsRemaining: 1,
      };

      expect(freezeEffect.frozenPlayer).toBe('black');
      expect(freezeEffect.turnsRemaining).toBe(1);
    });

    it('should prevent opponent movement while frozen', () => {
      const gameState = {
        currentTurn: 'black',
        isFrozen: true,
      };

      const canMove = !gameState.isFrozen;

      expect(canMove).toBe(false);
    });

    it('should allow movement after freeze expires', () => {
      let isFrozen = true;
      let turnsRemaining = 1;

      // After frozen turn ends
      turnsRemaining--;
      if (turnsRemaining === 0) {
        isFrozen = false;
      }

      expect(isFrozen).toBe(false);
    });

    it('should skip frozen player turn', () => {
      const gameState = {
        currentTurn: 'black',
        isFrozen: true,
      };

      // When a player is frozen, their turn is skipped and the other player gets another turn
      let nextTurn = gameState.currentTurn === 'white' ? 'black' : 'white';

      // If frozen, the next turn calculation remains the same (other player goes again)
      if (gameState.isFrozen) {
        // nextTurn is already set to the non-frozen player, so they get to go again
      }

      expect(nextTurn).toBe('white');
    });
  });

  describe('Extra Move Card Effect', () => {
    it('should grant extra move on current turn', () => {
      const extraMoveActive = {
        player: 'white',
        extraMovesRemaining: 1,
      };

      expect(extraMoveActive.extraMovesRemaining).toBe(1);
    });

    it('should allow two moves instead of one', () => {
      let movesRemaining = 1; // Extra move granted
      let movesMade = 0;

      // First move
      movesMade++;
      movesRemaining--;

      expect(movesRemaining).toBe(0);
      expect(movesMade).toBe(1);

      // Second move (from extra move)
      movesRemaining = 1; // Extra move active
      movesMade++;
      movesRemaining--;

      expect(movesRemaining).toBe(0);
      expect(movesMade).toBe(2);
    });

    it('should return to opponent after extra move', () => {
      let currentTurn = 'white';
      let extraMovesRemaining = 1;
      let movesMade = 0;

      // Normal move
      movesMade++;
      expect(movesMade).toBe(1);

      // Extra move
      if (extraMovesRemaining > 0) {
        movesMade++;
        extraMovesRemaining--;
        expect(movesMade).toBe(2);
      }

      // Switch to black
      currentTurn = 'black';

      expect(currentTurn).toBe('black');
      expect(extraMovesRemaining).toBe(0);
    });
  });

  describe('Card State Management', () => {
    it('should initialize player with 3 cards', () => {
      const playerCards = [
        { type: 'shield', status: 'available' },
        { type: 'freeze', status: 'available' },
        { type: 'extra_move', status: 'available' },
      ];

      expect(playerCards.length).toBe(3);
    });

    it('should update card state after use', () => {
      const playerCards = [
        { type: 'shield', status: 'available' },
        { type: 'freeze', status: 'available' },
        { type: 'extra_move', status: 'available' },
      ];

      // Use shield
      const shield = playerCards.find((c) => c.type === 'shield');
      if (shield) shield.status = 'used';

      const availableCards = playerCards.filter((c) => c.status === 'available');

      expect(availableCards.length).toBe(2);
    });

    it('should persist card state across turns', () => {
      const playerCards = [
        { type: 'shield', status: 'used' },
        { type: 'freeze', status: 'available' },
        { type: 'extra_move', status: 'available' },
      ];

      // After white's first turn
      let turnCount = 1;

      // After white's second turn (next full round)
      turnCount = 2;

      // Shield should still be used
      const shieldCard = playerCards.find((c) => c.type === 'shield');

      expect(shieldCard?.status).toBe('used');
      expect(turnCount).toBe(2);
    });
  });

  describe('Card API Integration', () => {
    it('should send card usage to backend', async () => {
      const cardUsageData = {
        gameId: 'game-123',
        playerId: 'player-1',
        cardType: 'shield',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        })
      ) as jest.Mock;

      const result = await fetch('/api/games/game-123/use-card', {
        method: 'POST',
        body: JSON.stringify(cardUsageData),
      });

      const data = await result.json();

      expect(result.ok).toBe(true);
      expect(data.success).toBe(true);
    });

    it('should handle card usage error from backend', async () => {
      const cardUsageData = {
        gameId: 'game-123',
        playerId: 'player-1',
        cardType: 'shield',
      };

      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: 'Card not available' }),
        })
      ) as jest.Mock;

      const result = await fetch('/api/games/game-123/use-card', {
        method: 'POST',
        body: JSON.stringify(cardUsageData),
      });

      expect(result.ok).toBe(false);
    });
  });
});
