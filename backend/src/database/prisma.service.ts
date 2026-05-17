import { Injectable } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PrismaService {
  private pool: Pool;

  user = {
    findUnique: async (args: any) => {
      const { where } = args;
      if (where.id) {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [where.id]);
        return result.rows[0] || null;
      }
      if (where.email) {
        const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [where.email]);
        return result.rows[0] || null;
      }
      return null;
    },
    create: async (args: any) => {
      const { data } = args;
      const result = await this.pool.query(
        'INSERT INTO users (id, email, password, "themePreference", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [data.id || require('crypto').randomUUID(), data.email, data.password || '', data.themePreference || 'light', new Date(), new Date()]
      );
      return result.rows[0];
    },
    update: async (args: any) => {
      const { where, data } = args;
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(data).forEach(([key, value]) => {
        updates.push(`"${key}" = $${paramCount}`);
        values.push(value);
        paramCount++;
      });
      values.push(where.id);

      const result = await this.pool.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    },
  };

  game = {
    findUnique: async (args: any) => {
      const { where } = args;
      const result = await this.pool.query('SELECT * FROM games WHERE id = $1', [where.id]);
      return result.rows[0] || null;
    },
    findMany: async (args: any) => {
      const result = await this.pool.query('SELECT * FROM games ORDER BY "createdAt" DESC');
      return result.rows;
    },
    create: async (args: any) => {
      const { data } = args;
      const result = await this.pool.query(
        'INSERT INTO games (id, mode, status, "roomCode", "boardState", "currentTurn", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [
          data.id || require('crypto').randomUUID(),
          data.mode,
          data.status || 'active',
          data.room_code || '',
          data.board_state || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          data.current_turn || 'white',
          new Date(),
          new Date(),
        ]
      );
      return result.rows[0];
    },
    update: async (args: any) => {
      const { where, data } = args;
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      Object.entries(data).forEach(([key, value]) => {
        const dbKey = key === 'board_state' ? 'boardState' : key === 'current_turn' ? 'currentTurn' : key === 'room_code' ? 'roomCode' : key === 'active_effects' ? 'activeEffects' : key;
        updates.push(`"${dbKey}" = $${paramCount}`);
        values.push(value);
        paramCount++;
      });
      values.push(where.id);

      const result = await this.pool.query(
        `UPDATE games SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );
      return result.rows[0];
    },
  };

  powerCard = {
    findMany: async (args: any) => {
      const { where } = args;
      let query = 'SELECT * FROM "GameCard"';
      const values: any[] = [];
      if (where) {
        const conditions: string[] = [];
        if (where.game_id) {
          conditions.push(`"gameId" = $${values.length + 1}`);
          values.push(where.game_id);
        }
        if (where.player_id) {
          conditions.push(`"playerId" = $${values.length + 1}`);
          values.push(where.player_id);
        }
        if (conditions.length) {
          query += ' WHERE ' + conditions.join(' AND ');
        }
      }
      const result = await this.pool.query(query, values);
      return result.rows;
    },
    create: async (args: any) => {
      const { data } = args;
      const result = await this.pool.query(
        'INSERT INTO "GameCard" (id, "gameId", "playerId", "cardType", status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [
          data.id || require('crypto').randomUUID(),
          data.game_id,
          data.player_id,
          data.card_type,
          data.status || 'available',
        ]
      );
      return result.rows[0];
    },
  };

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback();
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
