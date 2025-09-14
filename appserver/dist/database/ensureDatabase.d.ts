interface DatabaseConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    ssl?: any;
}
export declare function ensureDatabaseExists(databaseName: string, config: DatabaseConfig): Promise<void>;
export {};
//# sourceMappingURL=ensureDatabase.d.ts.map