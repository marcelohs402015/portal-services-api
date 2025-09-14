import { ensureDatabaseExists } from '../database/ensureDatabase.js';
import { Database } from '../database/Database.js';
import { runMigrations } from '../database/migrations.js';
async function main() {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '5432');
    const database = process.env.DB_NAME || 'portalservicesdb';
    const user = process.env.DB_USER || 'admin';
    const password = process.env.DB_PASSWORD || 'admin';
    const useSSL = (process.env.DB_SSL || 'false').toLowerCase() === 'true';
    await ensureDatabaseExists(database, {
        host,
        port,
        user,
        password,
        ssl: useSSL ? { rejectUnauthorized: false } : false,
    });
    const db = new Database({ host, port, database, user, password, ssl: useSSL ? { rejectUnauthorized: false } : false });
    await runMigrations(db);
    await db.close();
}
main().catch(err => {
    console.error('DB setup failed:', err);
    process.exit(1);
});
//# sourceMappingURL=db-setup.js.map