import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class PostgresService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      console.log('✓ Database connected');
      client.release();
    } catch (error) {
      console.error('✗ Database connection failed:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('✓ Database disconnected');
  }

  async query<T = any>(text: string, values?: any[]): Promise<QueryResult<T>> {
    return this.pool.query(text, values);
  }

  async queryOne<T = any>(text: string, values?: any[]): Promise<T | null> {
    const result = await this.pool.query<T>(text, values);
    return result.rows[0] || null;
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
