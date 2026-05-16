import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PostgresService } from '../database/postgres.service';
import { ChessService } from '../chess/chess.service';

describe('GamesService', () => {
  let service: GamesService;
  let postgresServiceMock: any;
  let chessServiceMock: any;

  beforeEach(async () => {
    postgresServiceMock = {
      queryOne: jest.fn(),
      query: jest.fn(),
      transaction: jest.fn(),
    };

    chessServiceMock = {
      createFromFen: jest.fn(),
      createStartingPosition: jest.fn(),
      isMoveLegal: jest.fn(),
      executeMove: jest.fn(),
      getLegalMoves: jest.fn(),
      isInCheck: jest.fn(),
      isCheckmate: jest.fn(),
      getTurn: jest.fn(),
      getFen: jest.fn(),
      getHistory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        { provide: PostgresService, useValue: postgresServiceMock },
        { provide: ChessService, useValue: chessServiceMock },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateRoomCode', () => {
    it('should generate a valid room code', () => {
      const code = (service as any).generateRoomCode();
      expect(code).toHaveLength(6);
      expect(/^[A-HJ-NPQ-Z2-9]{6}$/.test(code)).toBe(true);
    });

    it('should not include ambiguous characters', () => {
      for (let i = 0; i < 100; i++) {
        const code = (service as any).generateRoomCode();
        expect(code).not.toMatch(/[0OI1]/);
      }
    });
  });

  describe('generateAndAssignCards', () => {
    it('should generate cards for both host and guest', () => {
      const result = (service as any).generateAndAssignCards();
      expect(result.hostCards).toHaveLength(4);
      expect(result.guestCards).toHaveLength(4);
    });

    it('should distribute all 8 cards without duplicates', () => {
      const result = (service as any).generateAndAssignCards();
      const allCards = [...result.hostCards, ...result.guestCards];
      const uniqueCards = new Set(allCards);
      expect(uniqueCards.size).toBe(8);
    });

    it('should only use valid card types', () => {
      const validCards = [
        'skip_turn',
        'reverse_move',
        'extra_move',
        'teleport',
        'shield',
        'sacrifice',
        'wild_swap',
        'freeze',
      ];

      const result = (service as any).generateAndAssignCards();
      const allCards = [...result.hostCards, ...result.guestCards];

      allCards.forEach((card) => {
        expect(validCards).toContain(card);
      });
    });
  });
});
