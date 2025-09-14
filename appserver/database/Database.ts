import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DatabaseConfig } from '../types/database.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class Database {
  private pool: Pool;
  private logger: Logger;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.logger = createLogger('Database');
    this.config = config;

    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: config.password,
      ssl: config.ssl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });
  }

  getConfig(): DatabaseConfig {
    return this.config;
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result: QueryResult<T> = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      this.logger.debug(`Executed query in ${duration}ms`, { text, duration, rowCount: result.rowCount });
      return result;
    } catch (error) {
      this.logger.error('Query error', { text, params, error: (error as Error).message });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
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

  async close(): Promise<void> {
    await this.pool.end();
    this.logger.info('Database pool closed');
  }
}


