import { Database } from './Database.js';
export interface DefaultCategory {
    name: string;
    description: string;
    color: string;
}
export interface DefaultService {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    duration: string;
}
export interface DefaultEmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
    variables: string[];
}
export interface DefaultSystemSetting {
    id: string;
    key: string;
    value: string;
    description: string;
}
export declare class DataSeeder {
    private database;
    constructor(database: Database);
    /**
     * Verifica se já existem dados no banco
     */
    hasData(): Promise<boolean>;
    /**
     * Carrega dados padrão se o banco estiver vazio
     */
    seedDefaultData(): Promise<void>;
    /**
     * Insere categorias padrão
     */
    private seedCategories;
    /**
     * Insere serviços padrão
     */
    private seedServices;
    /**
     * Insere templates de email padrão
     */
    private seedEmailTemplates;
    /**
     * Insere configurações do sistema
     */
    private seedSystemSettings;
    /**
     * Força o recarregamento de todos os dados padrão
     */
    forceReseed(): Promise<void>;
}
//# sourceMappingURL=seedData.d.ts.map