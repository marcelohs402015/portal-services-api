import { createLogger } from '../shared/logger.js';
const logger = createLogger('DataSeeder');
export class DataSeeder {
    constructor(database) {
        this.database = database;
    }
    /**
     * Verifica se já existem dados no banco
     */
    async hasData() {
        try {
            const categoriesResult = await this.database.query('SELECT COUNT(*) as count FROM categories');
            const servicesResult = await this.database.query('SELECT COUNT(*) as count FROM services');
            const categoriesCount = parseInt(categoriesResult.rows[0].count);
            const servicesCount = parseInt(servicesResult.rows[0].count);
            return categoriesCount > 0 || servicesCount > 0;
        }
        catch (error) {
            logger.error('Error checking existing data:', error.message);
            return false;
        }
    }
    /**
     * Carrega dados padrão se o banco estiver vazio
     */
    async seedDefaultData() {
        try {
            logger.info('Checking if database needs seeding...');
            const hasExistingData = await this.hasData();
            if (hasExistingData) {
                logger.info('Database already contains data, skipping seed');
                return;
            }
            logger.info('Database is empty, seeding default data...');
            await this.seedCategories();
            await this.seedServices();
            await this.seedEmailTemplates();
            await this.seedSystemSettings();
            logger.info('Default data seeded successfully');
        }
        catch (error) {
            logger.error('Failed to seed default data:', error.message);
            throw error;
        }
    }
    /**
     * Insere categorias padrão
     */
    async seedCategories() {
        const defaultCategories = [
            {
                name: 'Eletricista',
                description: 'Serviços de eletricidade residencial e comercial',
                color: '#FF6B6B'
            },
            {
                name: 'Encanador',
                description: 'Serviços de encanamento e hidráulica',
                color: '#4ECDC4'
            },
            {
                name: 'Pintor',
                description: 'Serviços de pintura residencial e comercial',
                color: '#45B7D1'
            },
            {
                name: 'Pedreiro',
                description: 'Serviços de alvenaria e construção',
                color: '#96CEB4'
            },
            {
                name: 'Marceneiro',
                description: 'Serviços de marcenaria e carpintaria',
                color: '#FFEAA7'
            }
        ];
        for (const category of defaultCategories) {
            await this.database.query(`INSERT INTO categories (name, description, color) 
         VALUES ($1, $2, $3)`, [
                category.name,
                category.description,
                category.color
            ]);
        }
        logger.info(`Seeded ${defaultCategories.length} default categories`);
    }
    /**
     * Insere serviços padrão
     */
    async seedServices() {
        const defaultServices = [
            {
                id: 'eletricista-instalacao',
                name: 'Instalação Elétrica',
                description: 'Instalação completa de sistema elétrico residencial',
                category: 'Eletricista',
                price: 80.00,
                duration: '4-8 horas'
            },
            {
                id: 'eletricista-manutencao',
                name: 'Manutenção Elétrica',
                description: 'Reparo e manutenção de instalações elétricas',
                category: 'Eletricista',
                price: 60.00,
                duration: '1-3 horas'
            },
            {
                id: 'encanador-vazamento',
                name: 'Reparo de Vazamento',
                description: 'Reparo de vazamentos em canos e conexões',
                category: 'Encanador',
                price: 70.00,
                duration: '1-4 horas'
            },
            {
                id: 'encanador-instalacao',
                name: 'Instalação Hidráulica',
                description: 'Instalação de sistema hidráulico completo',
                category: 'Encanador',
                price: 90.00,
                duration: '6-12 horas'
            },
            {
                id: 'pintor-residencial',
                name: 'Pintura Residencial',
                description: 'Pintura de paredes e tetos em residências',
                category: 'Pintor',
                price: 25.00,
                duration: '1-3 dias'
            },
            {
                id: 'pedreiro-alvenaria',
                name: 'Alvenaria',
                description: 'Construção e reparo de paredes e estruturas',
                category: 'Pedreiro',
                price: 45.00,
                duration: '2-5 dias'
            },
            {
                id: 'marceneiro-moveis',
                name: 'Fabricação de Móveis',
                description: 'Fabricação de móveis sob medida',
                category: 'Marceneiro',
                price: 120.00,
                duration: '1-2 semanas'
            }
        ];
        for (const service of defaultServices) {
            await this.database.query(`INSERT INTO services (name, description, category, price, duration) 
         VALUES ($1, $2, $3, $4, $5)`, [
                service.name,
                service.description,
                service.category,
                service.price,
                service.duration
            ]);
        }
        logger.info(`Seeded ${defaultServices.length} default services`);
    }
    /**
     * Insere templates de email padrão
     */
    async seedEmailTemplates() {
        const defaultTemplates = [
            {
                id: 'orcamento-padrao',
                name: 'Orçamento Padrão',
                subject: 'Orçamento - {{service_name}}',
                body: `Olá {{client_name}},

Obrigado pelo seu interesse em nossos serviços!

Segue abaixo o orçamento solicitado:

Serviço: {{service_name}}
Descrição: {{service_description}}
Valor: R$ {{service_price}}

Este orçamento é válido por 30 dias.

Atenciosamente,
Equipe Portal Services`,
                category: 'Eletricista',
                variables: ['client_name', 'service_name', 'service_description', 'service_price']
            },
            {
                id: 'agendamento-confirmacao',
                name: 'Confirmação de Agendamento',
                subject: 'Agendamento Confirmado - {{service_name}}',
                body: `Olá {{client_name}},

Seu agendamento foi confirmado!

Data: {{appointment_date}}
Horário: {{appointment_time}}
Serviço: {{service_name}}

Nos vemos em breve!

Atenciosamente,
Equipe Portal Services`,
                category: 'Eletricista',
                variables: ['client_name', 'appointment_date', 'appointment_time', 'service_name']
            }
        ];
        for (const template of defaultTemplates) {
            await this.database.query(`INSERT INTO email_templates (id, name, subject, body, category, variables) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (id) DO NOTHING`, [
                template.id,
                template.name,
                template.subject,
                template.body,
                template.category,
                JSON.stringify(template.variables)
            ]);
        }
        logger.info(`Seeded ${defaultTemplates.length} default email templates`);
    }
    /**
     * Insere configurações do sistema
     */
    async seedSystemSettings() {
        const defaultSettings = [
            {
                id: 'email-config',
                key: 'email_config',
                value: JSON.stringify({
                    smtp_host: 'smtp.gmail.com',
                    smtp_port: 587,
                    use_tls: true
                }),
                description: 'Configurações de email SMTP'
            },
            {
                id: 'app-config',
                key: 'app_config',
                value: JSON.stringify({
                    default_quotation_validity_days: 30,
                    max_appointments_per_day: 10
                }),
                description: 'Configurações gerais da aplicação'
            },
            {
                id: 'ai-config',
                key: 'ai_config',
                value: JSON.stringify({
                    confidence_threshold: 0.7,
                    auto_respond: false
                }),
                description: 'Configurações de IA para categorização'
            }
        ];
        for (const setting of defaultSettings) {
            await this.database.query(`INSERT INTO system_settings (id, key, value, description) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (id) DO NOTHING`, [
                setting.id,
                setting.key,
                setting.value,
                setting.description
            ]);
        }
        logger.info(`Seeded ${defaultSettings.length} default system settings`);
    }
    /**
     * Força o recarregamento de todos os dados padrão
     */
    async forceReseed() {
        try {
            logger.info('Force reseeding all default data...');
            // Limpar dados existentes (cuidado em produção!)
            await this.database.query('DELETE FROM system_settings');
            await this.database.query('DELETE FROM email_templates');
            await this.database.query('DELETE FROM services');
            await this.database.query('DELETE FROM categories');
            // Recarregar dados
            await this.seedCategories();
            await this.seedServices();
            await this.seedEmailTemplates();
            await this.seedSystemSettings();
            logger.info('Force reseed completed successfully');
        }
        catch (error) {
            logger.error('Failed to force reseed:', error.message);
            throw error;
        }
    }
}
//# sourceMappingURL=seedData.js.map