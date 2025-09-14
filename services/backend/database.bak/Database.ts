import { Pool, PoolClient, QueryResult } from 'pg';
import { DatabaseConfig } from '../types/database.js';
import { createLogger } from '../shared/logger.js';
import { Logger } from 'winston';

export class Database {
  private pool: Pool;
  private logger: Logger;

  constructor(config: DatabaseConfig) {
    this.logger = createLogger('Database');
    
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

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const result = await this.pool.query<T>(text, params);
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

  async createTables(): Promise<void> {
    const createEmailsTable = `
      CREATE TABLE IF NOT EXISTS emails (
        id SERIAL PRIMARY KEY,
        gmail_id VARCHAR(255) UNIQUE NOT NULL,
        subject TEXT NOT NULL,
        sender VARCHAR(500) NOT NULL,
        date TIMESTAMP NOT NULL,
        body TEXT,
        snippet TEXT,
        category VARCHAR(100),
        confidence DECIMAL(3,2),
        processed BOOLEAN DEFAULT FALSE,
        responded BOOLEAN DEFAULT FALSE,
        response_template VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(500) NOT NULL,
        body TEXT NOT NULL,
        category VARCHAR(100),
        variables JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_emails_gmail_id ON emails(gmail_id);
      CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
      CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(date);
      CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(processed);
      CREATE INDEX IF NOT EXISTS idx_templates_category ON email_templates(category);
    `;

    const createTriggers = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_emails_updated_at ON emails;
      CREATE TRIGGER update_emails_updated_at
        BEFORE UPDATE ON emails
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_templates_updated_at ON email_templates;
      CREATE TRIGGER update_templates_updated_at
        BEFORE UPDATE ON email_templates
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `;

    try {
      await this.query(createEmailsTable);
      await this.query(createTemplatesTable);
      await this.query(createIndexes);
      await this.query(createTriggers);
      
      this.logger.info('Database tables created successfully');
    } catch (error) {
      this.logger.error('Failed to create database tables:', (error as Error).message);
      throw error;
    }
  }

  async insertDefaultTemplates(): Promise<void> {
    const templates = [
      {
        name: 'Resposta Automática - Reclamação',
        subject: 'Re: \$\{subject\}',
        body: `Prezado(a) cliente,

Agradecemos por entrar em contato conosco e lamentamos pelos inconvenientes causados.

Recebemos sua reclamação e ela será analisada por nossa equipe especializada. Retornaremos em até 24 horas com uma solução para o seu problema.

Seu protocolo de atendimento é: \$\{protocol\}

Atenciosamente,
Equipe de Atendimento`,
        category: 'reclamacao',
        variables: ['subject', 'protocol']
      },
      {
        name: 'Resposta Automática - Orçamento',
        subject: 'Re: \${subject} - Orçamento Solicitado',
        body: `Prezado(a) cliente,

Agradecemos por seu interesse em nossos produtos/serviços.

Recebemos sua solicitação de orçamento e nossa equipe comercial entrará em contato em até 24 horas com uma proposta personalizada.

Para agilizar o processo, por favor nos informe:
- Quantidade desejada
- Prazo de entrega
- Localização para entrega

Atenciosamente,
Equipe Comercial`,
        category: 'orcamento',
        variables: ['subject']
      },
      {
        name: 'Resposta Automática - Informações Produto',
        subject: 'Re: \${subject} - Informações do Produto',
        body: `Prezado(a) cliente,

Agradecemos por seu interesse em nossos produtos.

Recebemos sua solicitação de informações e nossa equipe técnica entrará em contato em até 12 horas com todas as especificações e detalhes solicitados.

Caso tenha alguma dúvida específica, não hesite em nos contatar.

Atenciosamente,
Equipe Técnica`,
        category: 'informacoes_produto',
        variables: ['subject']
      }
    ];

    for (const template of templates) {
      try {
        await this.query(
          `INSERT INTO email_templates (name, subject, body, category, variables) 
           VALUES ($1, $2, $3, $4, $5) 
           ON CONFLICT DO NOTHING`,
          [template.name, template.subject, template.body, template.category, JSON.stringify(template.variables)]
        );
      } catch (error) {
        this.logger.warn(`Failed to insert template ${template.name}:`, (error as Error).message);
      }
    }

    this.logger.info('Default email templates inserted');
  }
}