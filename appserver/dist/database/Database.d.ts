import { PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DatabaseConfig } from '../types/database.js';
export declare class Database {
    private pool;
    private logger;
    private config;
    constructor(config: DatabaseConfig);
    getConfig(): DatabaseConfig;
    query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    getClient(): Promise<PoolClient>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
//# sourceMappingURL=Database.d.ts.map