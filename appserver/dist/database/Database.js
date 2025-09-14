import { Pool } from 'pg';
import { createLogger } from '../shared/logger.js';
export class Database {
    constructor(config) {
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
    getConfig() {
        return this.config;
    }
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            this.logger.debug(`Executed query in ${duration}ms`, { text, duration, rowCount: result.rowCount });
            return result;
        }
        catch (error) {
            this.logger.error('Query error', { text, params, error: error.message });
            throw error;
        }
    }
    async getClient() {
        return this.pool.connect();
    }
    async transaction(callback) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async close() {
        await this.pool.end();
        this.logger.info('Database pool closed');
    }
}
//# sourceMappingURL=Database.js.map