export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean | Record<string, any>;
}
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
}
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
export interface FilterOptions {
    category?: string;
    from?: string;
    dateFrom?: Date;
    dateTo?: Date;
    responded?: boolean;
    processed?: boolean;
}
//# sourceMappingURL=database.d.ts.map