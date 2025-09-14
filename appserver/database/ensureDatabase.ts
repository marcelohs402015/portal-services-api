import pkg from 'pg';
const { Client } = pkg;
import { createLogger } from '../shared/logger.js';

const logger = createLogger('EnsureDatabase');

interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  ssl?: any;
}

export async function ensureDatabaseExists(
  databaseName: string,
  config: DatabaseConfig
): Promise<void> {
  const client = new Client({
    user: config.user,
    password: config.password,
    host: config.host,
    port: config.port,
    ssl: config.ssl,
    database: 'postgres' // Conecta ao banco padrão para criar o banco de dados
  });

  try {
    await client.connect();
    logger.info(`Conectado ao PostgreSQL como ${config.user}@${config.host}:${config.port}`);

    // Verifica se o banco de dados existe
    const result = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (result.rows.length === 0) {
      logger.info(`Criando banco de dados: ${databaseName}`);
      await client.query(`CREATE DATABASE "${databaseName}"`);
      logger.info(`Banco de dados ${databaseName} criado com sucesso`);
    } else {
      logger.info(`Banco de dados ${databaseName} já existe`);
    }

  } catch (error) {
    logger.error('Erro ao verificar/criar banco de dados:', (error as Error).message);
    throw error;
  } finally {
    await client.end();
  }
}
